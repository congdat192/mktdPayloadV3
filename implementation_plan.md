# Implementation Plan: Advanced Product Management

## Goal
Transform the basic Product Form into a powerful, WooCommerce-like editor that supports Variable Products, Attributes, Variations, Gallery, and SEO.

## User Review Required
> [!IMPORTANT]
> This is a major refactor of the `ProductForm`. Existing simple products will need to be migrated or compatible with the new schema structure.

## Proposed Changes

### 1. Refactor Product Form Layout
- **File:** `custom-admin-ui/app/dashboard/products/product-form.tsx`
- **Change:** Replace the single-column layout with a **Tabbed Interface** using `Tabs` component.
- **Tabs:**
    1.  **General:** Basic info (Title, Slug, Description), Pricing, Tax.
    2.  **Inventory:** SKU, Stock status, Quantity.
    3.  **Shipping:** Weight, Dimensions (if needed).
    4.  **Attributes:** Manager for adding/removing attributes (Color, Size).
    5.  **Variations:** (Only visible if "Variable Product" is selected) Interface to generate and edit variations.
    6.  **Linked Products:** Upsells, Cross-sells.
    7.  **SEO:** Meta tags.

### 2. Implement Product Gallery
- **File:** `custom-admin-ui/components/products/product-gallery.tsx` (NEW)
- **Feature:**
    - Allow selecting multiple images from `MediaLibraryModal`.
    - Drag and drop to reorder (using `@dnd-kit` or similar if requested, or simple array manipulation first).
    - "Set Product Image" (Featured) vs "Product Gallery".

### 3. Implement Attributes Management
- **File:** `custom-admin-ui/components/products/product-attributes.tsx` (NEW)
- **Feature:**
    - UI to add "Custom Attribute" or select from "Global Attributes".
    - Interface to input values (e.g., "Blue | Red | Green").
    - Checkbox: "Used for variations".

### 4. Implement Variations Management
- **File:** `custom-admin-ui/components/products/product-variations.tsx` (NEW)
- **Feature:**
    - "Generate Variations" button: Creates all combinations from attributes.
    - Accordion list of variations.
    - Each variation has its own: SKU, Price, Sale Price, Stock, Image.

### 5. API Updates
- **File:** `custom-admin-ui/lib/payload-client.ts`
- **Change:** Add methods to fetch `ProductAttributes` and `ProductVariations`.

## Verification Plan

### Manual Verification
1.  **Create Simple Product:** Verify basic fields, gallery, and SEO save correctly.
2.  **Create Variable Product:**
    - Add Attributes (Color: Red, Blue).
    - Generate Variations.
    - Set different prices for Red and Blue.
    - Save and Verify in Payload Admin that data is structured correctly.
