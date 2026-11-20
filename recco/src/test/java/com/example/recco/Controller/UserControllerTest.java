package com.example.recco.Controller;

import com.example.recco.Model.UserInterest;
import com.example.recco.Service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class UserControllerTest {
    @Test
    void acceptsDescriptionOf10000Characters() {
        StubUserService userService = new StubUserService();
        UserController controller = new UserController(userService);
        String description = "x".repeat(10_000);

        var response = controller.updateUserInterest(
                1L,
                new UserController.InterestUpdateDto("Title", description, null));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(description, userService.updatedDescription);
    }

    @Test
    void rejectsDescriptionLongerThan10000Characters() {
        StubUserService userService = new StubUserService();
        UserController controller = new UserController(userService);

        var response = controller.updateUserInterest(
                1L,
                new UserController.InterestUpdateDto("Title", "x".repeat(10_001), null));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(userService.updateCalled);
    }

    private static class StubUserService extends UserService {
        private String updatedDescription;
        private boolean updateCalled;

        private StubUserService() {
            super(null);
        }

        @Override
        public Optional<UserInterest> updateUserInterest(
                Long interestId,
                String title,
                String description,
                LocalDate date) {
            updateCalled = true;
            updatedDescription = description;
            return Optional.of(new UserInterest());
        }
    }
}
