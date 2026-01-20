# Design Guidelines: Italian Menopause Nutrition Web App

## Design Approach

**Reference-Based Strategy:** Drawing from Calm (wellness warmth), Notion (elegant modern UI), and Apple Health (healthcare credibility). Combining professional healthcare authority with feminine, supportive aesthetics.

**Core Principles:**
1. Elegant professionalism meets Mediterranean warmth
2. Glassmorphism as signature visual language
3. Trust-building through healthcare credibility
4. Empowering, supportive feminine energy

## Typography

**Font Families (Google Fonts):**
- Primary: 'Playfair Display' (headings) - elegant, sophisticated serif
- Secondary: 'Inter' (body, UI) - clean, professional sans-serif

**Hierarchy:**
- H1: Playfair Display, 56px/64px, font-weight 600
- H2: Playfair Display, 40px/48px, font-weight 600
- H3: Playfair Display, 32px/40px, font-weight 500
- H4: Inter, 20px/28px, font-weight 600
- Body: Inter, 16px/24px, font-weight 400
- Small: Inter, 14px/20px, font-weight 400

## Layout System

**Spacing Units (Tailwind):** Consistently use 4, 8, 12, 16, 24 (as in p-4, gap-8, py-12, space-y-16, py-24)

**Container Widths:**
- max-w-7xl for main content sections
- max-w-4xl for centered text content
- max-w-6xl for feature grids

## Component Library

### Glassmorphism Card Pattern
- backdrop-blur-xl with subtle white/transparency overlay
- Soft shadow: shadow-xl with reduced opacity
- 1px border with subtle white/30% opacity
- Rounded corners: rounded-2xl

### Navigation
Sticky header with glassmorphism effect, logo left, navigation center, CTA button right. Blurred background when scrolled.

### Buttons
- Primary: Soft gradient, rounded-full, px-8 py-4, font-weight 600
- Secondary: Glassmorphism effect with backdrop-blur
- When on images: Add backdrop-blur-md bg-white/20 border border-white/30

### Cards
- Meal plan cards: Glassmorphism with meal image, nutrition info overlay
- Feature cards: Icon, heading, description with generous padding (p-8)
- Testimonial cards: Photo, quote, name/age in glassmorphism containers

### Forms
- Input fields: Glassmorphism style, rounded-xl, backdrop-blur-lg
- Focus states: Subtle glow effect, increased border opacity
- Labels: Inter font-weight 500, positioned above inputs

## Page Structure

### Hero Section (80vh)
Large background image: Mediterranean meal spread or woman enjoying healthy meal in Italian kitchen setting. Hero contains centered heading, subheading, dual CTAs ("Start Your Journey" + "See How It Works"), trust indicator ("Endorsed by 500+ healthcare professionals"). Glassmorphism card overlay for text/buttons.

### AI Features Section (py-24)
Grid of 3 feature cards showcasing AI personalization, nutrition tracking, Italian recipe database. Each card has icon, heading, description, micro-illustration or screenshot preview.

### Meal Plan Preview (py-24)
Showcase carousel/grid of 4-6 meal cards with glassmorphism effects, beautiful food photography, nutrition labels, Italian recipe names. Interactive preview encouraging engagement.

### How It Works (py-20)
3-step visual timeline: Sign Up → AI Analysis → Personalized Plans. Use stepped connector lines, numbered circles, illustrations.

### Healthcare Credibility (py-16)
Professional endorsements section with doctor photos, credentials, quotes. Medical advisory board showcase. Glassmorphism cards with subtle elegance.

### Subscription Tiers (py-24)
3 pricing cards (Basic, Premium, Professional) in horizontal layout. Center card emphasized with scale transform. Include feature lists, pricing, monthly/annual toggle. Glassmorphism styling throughout.

### Testimonials (py-20)
Masonry grid of 6-8 testimonials with photos of women 45+, age displayed, transformation stories. Authentic, warm photography.

### Final CTA Section (py-32)
Split layout: Left side with compelling headline and button, right side with app preview or testimonial highlight. Soft gradient background.

### Footer (py-16)
4-column layout: About, Resources, Support, Newsletter signup. Social links, trust badges (medical certifications), language selector (Italian/English toggle).

## Images

**Hero Image:** Mediterranean kitchen scene or elegant table setting with Italian healthy meal, warm natural lighting, professional food photography style.

**Meal Cards (8-10 images):** High-quality Italian dishes - pasta primavera, grilled fish with vegetables, caprese salad, minestrone, etc. Styled beautifully with garnishes.

**Testimonial Photos (6-8):** Authentic headshots of women 45-55+, warm smiles, professional quality, diverse but Mediterranean aesthetic.

**Feature Section:** Consider light illustrations or screenshots of app interface showing AI features.

**Healthcare Section:** Professional headshots of 3-4 medical advisors in white coats or professional attire.

## Special Effects

**Glassmorphism Implementation:**
Apply to navigation, cards, buttons on images, form inputs, modal overlays. Consistent blur strength (backdrop-blur-xl) with varying opacity based on hierarchy.

**Subtle Animations:**
- Gentle fade-in on scroll for cards
- Smooth hover lift (translateY -4px) on interactive cards
- Soft scale on CTA buttons (1.02)
Keep animations minimal and elegant

## Accessibility

Maintain WCAG AA contrast ratios despite glassmorphism. Ensure text readability over blurred backgrounds. All interactive elements have clear focus states with visible outlines.