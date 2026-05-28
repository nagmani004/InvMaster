from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Product Schemas
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = Field(None, ge=0)

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str = Field(..., min_length=1)
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(..., gt=0)

class Order(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    total_amount: float

    class Config:
        from_attributes = True
