# UI Components Visual Guide

## Header Layout

### Before Authentication
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                        Recco                   [Sign In]  [Sign Up] ║
║                     User Management                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### After Authentication
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                        Recco              user@email.com  [Logout] ║
║                     User Management                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Auth Modal - Sign In

```
╔════════════════════════════════════════════════════╗
║                          × (close)                 ║
║                   Sign In                          ║
║                                                    ║
║  ┌─────────────────────────────────────────────┐  ║
║  │ Email                                       │  ║
║  │ [______________________________]             │  ║
║  └─────────────────────────────────────────────┘  ║
║                                                    ║
║  ┌─────────────────────────────────────────────┐  ║
║  │ Password                                    │  ║
║  │ [______________________________]             │  ║
║  └─────────────────────────────────────────────┘  ║
║                                                    ║
║           [Sign In]                               ║
║                                                    ║
║  Don't have an account? [Sign Up]                 ║
╚════════════════════════════════════════════════════╝
```

## Auth Modal - Sign Up

```
╔════════════════════════════════════════════════════╗
║                          × (close)                 ║
║                  Create Account                    ║
║                                                    ║
║  ┌─────────────────────────────────────────────┐  ║
║  │ First Name                                  │  ║
║  │ [______________________________]             │  ║
║  └─────────────────────────────────────────────┘  ║
║                                                    ║
║  ┌─────────────────────────────────────────────┐  ║
║  │ Last Name                                   │  ║
║  │ [______________________________]             │  ║
║  └─────────────────────────────────────────────┘  ║
║                                                    ║
║  ┌─────────────────────────────────────────────┐  ║
║  │ Email                                       │  ║
║  │ [______________________________]             │  ║
║  └─────────────────────────────────────────────┘  ║
║                                                    ║
║  ┌─────────────────────────────────────────────┐  ║
║  │ Password                                    │  ║
║  │ [______________________________]             │  ║
║  └─────────────────────────────────────────────┘  ║
║                                                    ║
║           [Sign Up]                               ║
║                                                    ║
║  Already have an account? [Sign In]               ║
╚════════════════════════════════════════════════════╝
```

## Unauthenticated Landing Page

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                        Recco                   [Sign In]  [Sign Up] ║
║                     User Management                        ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║                                                           ║
║                  Please sign in to continue               ║
║                                                           ║
║     Sign in or create an account to access the           ║
║         user management system.                          ║
║                                                           ║
║              [Sign In Now]   [Create Account]             ║
║                                                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Main App - Navigation

```
╔═══════════════════════════════════════════════════════════╗
║                        Recco                              ║
║                     User Management                        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║            [Register]        [Users]                      ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║              (Tab Content Below)                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Users Tab - With User Cards

```
╔═══════════════════════════════════════════════════════════╗
║              Users                            [Refresh]   ║
║                                                           ║
║  [Search by name...] ← Search Box                         ║
║                                                           ║
║  ╔════════════════════╗  ╔════════════════════╗           ║
║  ║ John Doe           ║  ║ Jane Smith         ║           ║
║  ║ john@example.com   ║  ║ jane@example.com   ║           ║
║  ║ ID: 8de402e9...    ║  ║ ID: 3c091a1a...    ║           ║
║  ║ (clickable)        ║  ║ (clickable)        ║           ║
║  ╚════════════════════╝  ╚════════════════════╝           ║
║                                                           ║
║  ╔════════════════════╗  ╔════════════════════╗           ║
║  ║ Bob Wilson         ║  ║ Alice Brown        ║           ║
║  ║ bob@example.com    ║  ║ alice@example.com  ║           ║
║  ║ ID: a1b2c3d4...    ║  ║ ID: e5f6g7h8...    ║           ║
║  ║ (clickable)        ║  ║ (clickable)        ║           ║
║  ╚════════════════════╝  ╚════════════════════╝           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## User Profile Page

```
╔═══════════════════════════════════════════════════════════╗
║ [← Back to Users]                                        ║
║                                                           ║
║  ╔═══════════════════════════════════════════════════╗   ║
║  ║                                                   ║   ║
║  ║         [J]      John Doe                         ║   ║
║  ║       (Avatar)   john@example.com                 ║   ║
║  ║                                                   ║   ║
║  ╚═══════════════════════════════════════════════════╝   ║
║                                                           ║
║  ╔═══════════════════════════════════════════════════╗   ║
║  ║ User Information                                  ║   ║
║  ║                                                   ║   ║
║  ║ First Name:    John                              ║   ║
║  ║ Last Name:     Doe                               ║   ║
║  ║ Email:         john@example.com                  ║   ║
║  ║ User ID:       8de402e9-7c03-4d6d-aee1-55e99909 ║   ║
║  ║                f65d                              ║   ║
║  │                                                   │   ║
║  ╚═══════════════════════════════════════════════════╝   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Colors & Styling

### Color Palette
- **Primary**: #667eea (Purple/Blue)
- **Secondary**: #764ba2 (Dark Purple)
- **Gradient**: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- **Text**: #333 (Dark Gray)
- **Light Text**: #666 (Medium Gray)
- **Border**: #ddd (Light Gray)
- **Background**: #fafafa (Very Light Gray)
- **Success**: #d4edda (Light Green)
- **Error**: #f8d7da (Light Red)

### Typography
- **Headers**: 1.5-2.5rem, Bold
- **Labels**: 0.95rem, Medium Weight
- **Body Text**: 1rem, Regular Weight
- **Small Text**: 0.85-0.9rem, Regular Weight

### Button Styles

**Primary Buttons** (Sign In, Login)
```
Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Color: White
Padding: 0.75rem 1.2rem
Border Radius: 6px
```

**Secondary Buttons** (Sign Up, Create Account)
```
Background: White
Color: #667eea
Border: 2px solid #667eea
Padding: 0.75rem 1.2rem
Border Radius: 6px
```

**Hover Effects**
```
- Transform: translateY(-2px) [Move up]
- Box-shadow: 0 4px 12px rgba(0,0,0,0.2) [Drop shadow]
```

### Forms
- **Input Padding**: 0.75rem
- **Input Border**: 1px solid #ddd
- **Focus Border**: #667eea
- **Focus Shadow**: 0 0 0 3px rgba(102, 126, 234, 0.1)
- **Border Radius**: 6px

### Cards
- **Background**: White
- **Border Radius**: 12px
- **Box Shadow**: 0 2px 8px rgba(0, 0, 0, 0.1)
- **Hover Effect**: 
  - Transform: translateY(-4px)
  - Box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)

### Responsive Breakpoints

**Mobile** (< 600px)
- Full width containers
- Stack elements vertically
- Touch-friendly button sizes
- Single column layouts

**Tablet** (600px - 1024px)
- 2 column user grids
- Adjusted padding/margins
- Responsive navigation

**Desktop** (> 1024px)
- Multi-column layouts
- Normal spacing
- Side-by-side components

## Interaction States

### Sign In Button
```
Default:  Background: transparent, Border: 2px white, Color: white
Hover:    Background: rgba(255,255,255,0.1), Border: 2px white
Active:   Being clicked - slight feedback
```

### User Cards
```
Default:  Normal shadow, left border purple
Hover:    Lifted up (translateY -4px), larger shadow, cursor pointer
Active:   Being clicked - slight opacity change
```

### Search Input
```
Default:  Border: 1px solid #ddd
Focus:    Border: 1px solid #667eea, shadow
Typing:   Triggers live search on backend
```

### Modal Overlay
```
Background: rgba(0, 0, 0, 0.5) [Semi-transparent black]
Animation:  slideUp (0.3s ease) - enters from bottom
Close:      Click overlay or × button closes modal
```

---

**Note**: All components are fully responsive and work on mobile, tablet, and desktop screens.
