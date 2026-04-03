

# Premium Finance Dashboard — Implementation Plan

## 1. Design System & Theme
- Custom color palette: warm off-whites, deep indigo/purple primaries, semantic greens/reds
- Dark theme with rich charcoal backgrounds and subtle glow effects
- CSS variables for both themes, smooth `transition` on theme switch
- Persist preference in localStorage via a `useTheme` hook
- Glassmorphism utility classes, layered shadows, gradient accents

## 2. Authentication — Login Page
- Split layout: left panel with abstract gradient/shape artwork, right panel with centered login card
- Floating label inputs (email, password), "Remember me" checkbox, "Forgot password" link
- Inline validation, loading spinner on submit, error toast on failure
- Theme toggle visible on login page (top-right corner)
- Mock auth logic storing user role (viewer/analyst/admin) in context

## 3. App Shell — Sidebar & Navbar
- Collapsible sidebar with icon-only mini mode, smooth animation
- Sidebar links: Dashboard, Transactions, Users (admin only)
- Top navbar: search input, notification bell with badge, profile avatar dropdown, sun/moon theme toggle with rotation animation

## 4. Dashboard Overview Page
- 3 premium summary cards (Total Income, Expenses, Net Balance) with icons, trend arrows, subtle gradient borders
- Animated area/line chart (recharts) for income vs expenses over time
- Donut chart for spending categories with hover tooltips
- Recent transactions list with category icons, amounts, and dates
- Skeleton loaders while data loads

## 5. Financial Records Page
- Elegant data table with zebra striping and hover effects
- Filter bar: date range picker, type dropdown, category dropdown, search input
- Pagination controls
- Role-based action buttons (edit/delete for admin only)

## 6. User Management Page (Admin Only)
- User table: avatar, name, email, role dropdown, status toggle switch
- Protected route — redirects non-admin users
- Add/edit user modal

## 7. Role-Based Access
- React context storing current user role
- `useRole` hook and `<RoleGate>` wrapper component
- Viewer: read-only everywhere; Analyst: read + charts/insights; Admin: full CRUD + user management

## 8. Shared Components
- ThemeToggle (animated sun/moon icon button)
- Cards, Modal, Toast (sonner), Skeleton loaders
- Empty states and error states with illustrations
- Micro-interactions: hover scale, focus rings, button press effects

## 9. Visual Polish
- Controlled asymmetry in card grid layouts (varying card sizes)
- Layered card designs with offset shadows
- Gradient accent lines and borders
- Smooth page transitions with fade-in animations
- Responsive: desktop-first with adaptive mobile layouts (sidebar becomes drawer, cards stack)

## Pages & Routes
| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/` | Dashboard | All authenticated |
| `/transactions` | Financial Records | All authenticated |
| `/users` | User Management | Admin only |

