package com.example.recco.Config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class UserInterestTextColumnMigration implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    public UserInterestTextColumnMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        String columnType = jdbcTemplate.queryForObject(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = 'user_interests'
                  AND column_name = 'description'
                """,
                String.class);

        if (!"text".equalsIgnoreCase(columnType)) {
            jdbcTemplate.execute(
                    "ALTER TABLE user_interests ALTER COLUMN description TYPE TEXT");
        }
    }
}
