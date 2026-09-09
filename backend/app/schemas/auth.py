from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int


class CurrentUserResponse(BaseModel):
    user_id: int
    username: str
    role: str
    account_status: str