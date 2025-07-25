# Website UI/UX Redesign Plan for QuantifyIQ

## 1. Overall Design Philosophy & Consistency

The goal is to create a modern, intuitive, and trustworthy platform for beginner to intermediate investors interested in quantitative finance. The design should be clean, consistent, and educational.

-   **Consistency is Key:** All pages will share a consistent layout, color scheme, typography, and component styling. Elements like input fields, buttons, and cards will look and feel the same across the entire application.
-   **Centralized Portfolio Management:** The core of the user experience will revolve around a central portfolio. Users will create a portfolio once and then use it across all the tools (Efficient Frontier, Black-Litterman, etc.). This eliminates redundant data entry and simplifies the workflow. We will support creating and switching between multiple portfolios.
-   **Guided Experience:** The UI will guide the user, providing context and explanations. We'll use tooltips, info icons, and clear labeling to explain complex financial terms and model parameters.
-   **Visual Hierarchy:** A clear visual hierarchy will draw the user's attention to the most important information and actions on each page.

## 2. Global Changes

These changes will be implemented across the entire website.

### a. Dark Mode

-   **Implementation:** A dark mode toggle will be added to the main header. I will use CSS variables and `tailwindcss`'s dark mode features to manage color schemes for light and dark modes.
-   **Colors:** I will define a new color palette that works well in both light and dark modes, ensuring text is always readable and charts are clear.

### b. Consistent Footer

-   **Content:** A simple, non-intrusive footer will be added to every page. It will contain:
    -   © 2024 QuantifyIQ
    -   Links to a future "About Us", "Contact", and "Privacy Policy" page.
    -   A brief disclaimer about financial risk.

### c. Navigation and Flow

-   **Redesigned Header:** The header will be cleaned up. The "Create Portfolio" button will be more prominent. The navigation links will be clear and concise.
-   **Centralized Portfolio:** The main user flow will be:
    1.  User lands on the site and is prompted to create their first portfolio (e.g., entering tickers and weights).
    2.  This portfolio is saved and becomes the "active" portfolio.
    3.  The user can then navigate to any of the tool pages (Efficient Frontier, Black-Litterman, etc.), and the active portfolio's data is automatically loaded.
    4.  The user can create multiple portfolios and switch between them.
-   **State Management:** I'll use React Context (`PortfolioContext.tsx`) to manage the active portfolio's state globally, making it accessible to all components.

### d. Typography and Color Palette

-   **Fonts:** Standardize fonts across the application for a consistent look.
-   **Colors:** A new, modern color palette will be defined for both light and dark modes. This includes primary, secondary, accent, and success/error/warning colors.

## 3. Component & Page-Specific Changes

### a. Landing Page / Dashboard (`DashboardTab.tsx` & `WelcomeSection.tsx`)

-   **Integration:** The landing page will be more integrated. The "Welcome" section will be combined with the main dashboard.
-   **Dashboard:** The dashboard will show a summary of the currently selected portfolio. If no portfolio is selected, it will prompt the user to create one.
-   **Feature Cards:** The feature cards will be redesigned to be more visually appealing and will act as navigation points to the different tools.

### b. Portfolio Creation & Management

-   **Modal:** Portfolio creation/editing will happen in a modal (`ManualEntryModal.tsx`) that can be accessed from the header. This keeps the user in context.
-   **Input:** Users will enter stock tickers and weights. The modal will provide real-time feedback (e.g., sum of weights).
-   **Multiple Portfolios:** Users will be able to name their portfolios and switch between them using a dropdown in the header.

### c. Tool Pages (Efficient Frontier, Black-Litterman, etc.)

-   **Consistent Layout:** All tool pages will follow a similar layout:
    1.  **Page Title and Description:** Clearly explaining the tool.
    2.  **Configuration Panel:** A consistent, styled panel on the left or top where users can tweak parameters specific to that tool (e.g., confidence levels for Black-Litterman). The core portfolio data will be pre-filled.
    3.  **Results Display:** A main content area to display charts, tables, and key metrics.
-   **Efficient Frontier (`EfficientFrontierTab.tsx`):** The "Analyze Portfolio with EF" button will be restyled for consistency. The layout will be updated to match the new standard.
-   **Black-Litterman (`BlackLittermanTab.tsx`):**
    -   The input fields for "Expected Return" and "Confidence" will be restyled to match the application's design system.
    -   An "Overview" section will be added for consistency with the other pages.
-   **Stress Test:** The input textboxes will be restyled for consistency.
-   **Simulators (`SimulatorTab.tsx`):** The layout will be updated to the new standard. The input forms will be redesigned for clarity and consistency.

### d. Guide Page (`GuideTab.tsx`)

-   **Comprehensive Guide:** This page will be a central knowledge base.
-   **Structure:** It will be organized with a sidebar for navigation, with sections for each tool.
-   **Content:** Each section will explain:
    -   The purpose of the tool.
    -   The mathematical calculations behind it (explained in simple terms).
    -   How to interpret the results.

## 4. New Features

### a. Popups and Toasts

-   **Feedback:** I will use a toast notification library (like `sonner`, which is already in the project) to provide non-intrusive feedback to the user (e.g., "Portfolio saved successfully," "Error fetching data").
-   **Confirmation Modals:** For destructive actions (like deleting a portfolio), a confirmation modal will be used.

### b. Refined `PortfolioContext`

-   The `PortfolioContext.tsx` will be updated to handle:
    -   A list of portfolios.
    -   The currently active portfolio.
    -   Functions for creating, updating, and deleting portfolios.
    -   Persisting portfolios to `localStorage` so they are not lost on page refresh.

This plan provides a clear path to a more professional and user-friendly application. By focusing on consistency and a simplified user flow, we can significantly improve the user experience. 

## 5. Immediate Fixes & Polishing (July 2025 QA Review)

### 5.1 Navigation
- Remove the dedicated `Dashboard` link from the main navigation bar.
- Make the `QuantifyIQ` logo a clickable element that routes to `/` (Dashboard). Ensure a hover state is applied for accessibility.
- Update active-link highlighting logic accordingly.

### 5.2 Portfolio State Consistency
- Refactor `PortfolioContext` to expose a `getActivePortfolio()` helper and ensure it is imported by:
  - `StressTestTab.tsx`
  - `SimulatorTab.tsx`
  - Any other tool page that still requests manual ticker/weight entry.
- When an active portfolio exists, pre-populate ticker and weight fields and display a subtle info banner “Using active portfolio: {name}”.
- If no active portfolio is found, show the portfolio-creation modal.

### 5.3 Color & Typography Corrections
- Review all text colours in dark mode – several titles/subtitles are too low contrast (e.g. grey on grey in Dashboard cards).
- Use Tailwind variable `text-foreground` for primary text and `text-muted-foreground` for captions across all components.
- Update card header labels (e.g. “Platform Features”) to follow the `text-primary` token for better consistency.

### 5.4 Dark/Light Mode Theming
- Define light/dark background tokens for cards (`bg-card-light` / `bg-card-dark`) and apply via conditional class names.
- Ensure chart libraries pick up the current theme via CSS variables:
  - Provide an explicit colour palette to Recharts/ECharts that references the CSS tokens.
  - Axis labels, grid lines, and tooltip backgrounds should switch on theme change.
- Smooth out the Efficient Frontier page gradient transition; consider using `backdrop-blur` and `transition-colors` (duration 300 ms).

### 5.5 Layout & Scrolling
- Re-use the scrollable result container pattern implemented in **Black-Litterman** for **Efficient Frontier** to keep header and configuration panel sticky while results scroll.
- Hide native scrollbars via `scrollbar-none` and add inner padding for a smoother experience.

### 5.6 Miscellaneous
- The weight-sum validation message in **Stress Test** is orange on a dark background; switch to the `text-warning` colour token.
- Provide fall-back skeletons/placeholders for chart components to avoid white flashes while data loads.
- Ensure all headings (`h1`–`h4`) share the same Tailwind typography scale defined in `tailwind.config.ts`. 