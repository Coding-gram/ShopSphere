# ShopSphere entity-relationship diagram

The diagram reflects the Mongoose models under `server/src/models`. References are MongoDB `ObjectId` relationships; embedded values are shown inside their owning document.

```mermaid
erDiagram
    USER ||--o| CART : owns
    USER ||--o{ ADDRESS : saves
    USER ||--o{ ORDER : places
    CATEGORY ||--o{ PRODUCT : classifies
    CATEGORY o|--o{ CATEGORY : parent_of
    PRODUCT ||--o{ CART_ITEM : appears_in
    PRODUCT ||--o{ ORDER_ITEM : snapshot_in
    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--o{ PAYMENT_ATTEMPT : receives
    ORDER ||--o{ ORDER_AUDIT_EVENT : records
    USER ||--o{ ORDER_AUDIT_EVENT : acts_in
    USER ||--o{ INVENTORY_ADJUSTMENT : performs
    PRODUCT ||--o{ INVENTORY_ADJUSTMENT : changes

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "select false; bcrypt hash"
        enum role "customer|admin"
        string phone
        string avatar
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    CATEGORY {
        ObjectId _id PK
        string name UK
        string slug UK
        string description
        string image
        ObjectId parent FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT {
        ObjectId _id PK
        string name
        string slug UK
        string description
        number price
        number compareAtPrice
        ObjectId category FK
        string[] images
        number stock
        string sku UK
        string[] tags
        boolean isActive
        boolean isFeatured
        number avgRating
        number reviewCount
        datetime createdAt
        datetime updatedAt
    }

    CART {
        ObjectId _id PK
        ObjectId user FK,UK
        datetime createdAt
        datetime updatedAt
    }

    CART_ITEM {
        ObjectId _id
        ObjectId product FK
        number quantity
        number price "add-to-cart snapshot"
    }

    ADDRESS {
        ObjectId _id PK
        ObjectId user FK
        string fullName
        string phone
        string street
        string city
        string state
        string pincode
        string country
        boolean isDefault
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        ObjectId _id PK
        ObjectId user FK
        string orderNumber UK
        number subtotal
        number shippingCost
        number tax
        number total
        string checkoutIdempotencyKey
        string checkoutRequestFingerprint
        string cancellationIdempotencyKey
        string cancellationRequestFingerprint
        enum status
        enum paymentStatus
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEM {
        ObjectId product FK
        string name "immutable snapshot"
        string image "immutable snapshot"
        number quantity
        number price "immutable snapshot"
    }

    PAYMENT_ATTEMPT {
        ObjectId _id PK
        ObjectId order FK
        string idempotencyKey
        string requestFingerprint
        number amount
        string currency "INR"
        string provider "simulated"
        enum status "pending|succeeded|failed"
        string failureCode
        enum resultingOrderStatus
        enum resultingPaymentStatus
        datetime createdAt
        datetime updatedAt
    }

    ORDER_AUDIT_EVENT {
        ObjectId _id PK
        ObjectId order FK
        ObjectId actorId FK
        enum actorType "customer|admin|system"
        enum eventType
        enum fromStatus
        enum toStatus
        string note
        datetime createdAt
        datetime updatedAt
    }

    INVENTORY_ADJUSTMENT {
        ObjectId _id PK
        ObjectId product FK
        ObjectId actor FK
        number delta
        string reason
        number previousQuantity
        number newQuantity
        datetime createdAt
        datetime updatedAt
    }
```

## Important indexes

- `User`: unique `email`; `role`.
- `Category`: unique `name` and `slug`; `parent`.
- `Product`: unique `slug` and `sku`; `category`; `price`; text index on `name`, `tags`, `description`; `(isActive, isFeatured)`; `createdAt`.
- `Cart`: unique `user`.
- `Address`: `user`.
- `Order`: `(user, createdAt desc)`; `(status, paymentStatus, createdAt desc)`; unique partial `(user, checkoutIdempotencyKey)`; unique partial `(user, cancellationIdempotencyKey)`.
- `PaymentAttempt`: unique `(order, idempotencyKey)`; `(order, createdAt desc)`.
- `OrderAuditEvent`: `(order, createdAt desc)`; `(eventType, createdAt desc)`.
- `InventoryAdjustment`: `(product, createdAt desc)`; `(actor, createdAt desc)`.
