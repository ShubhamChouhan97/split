# import os
# from fastapi import APIRouter, HTTPException, Depends, Header, status, Cookie, Response
# from fastapi.responses import JSONResponse
# from ..schemas.user_schema import UserCreate, UserLogin, UserOut
# from ..models.user import create_user, find_by_email, find_by_id
# from ..utils.hash import hash_password, verify_password
# from ..utils.auth import create_access_token, verify_token

# router = APIRouter(tags=['auth'])

# @router.post("/auth/register", status_code=status.HTTP_201_CREATED)
# async def register(user: UserCreate):
#     # check if email already exists
#     exists = await find_by_email(user.email)
#     if exists:
#         # consistent error structure
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

#     # hash_password should return hashed password (never store plain text)
#     hashed = hash_password(user.password)

#     user_doc = {
#         "name": user.name,
#         "email": user.email,
#         "password": hashed,
#         "groups": []
#     }
#     try:
#         uid = await create_user(user_doc)
#     except Exception as exc:
#         # log exc server-side (not sent to client), return safe error to client
#         # logger.exception("Failed to create user")
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")

#     return {"id": str(uid), "message": "User created"}

# @router.post("/auth/login", response_model=dict)
# async def login(body: UserLogin, response: Response):
#     db_user = await find_by_email(body.email)
#     if not db_user or not verify_password(body.password, db_user["password"]):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")

#     token = create_access_token({"id": str(db_user["_id"]), "email": db_user["email"]})

#     is_production = os.getenv("ENVIRONMENT") == "production"

#     # Set HttpOnly cookie (browser will store it; JS cannot read it)
#     # Adjust secure flag depending on environment
#     response.set_cookie(
#         key="access_token",
#         value=token,
#         httponly=True,
#         secure=is_production,  # True in production (HTTPS), False in development (HTTP)
#         path="/",              # Set cookie path to root to ensure it's sent on all requests
#         # samesite="lax",
#         max_age=60 * 60 * 24 * 7  # 7 days, adjust as needed
#     )

#     user_out = {"id": str(db_user["_id"]), "name": db_user["name"], "email": db_user["email"], "groups": db_user.get("groups", [])}

#     return {"access_token": None, "token_type": "bearer", "user": user_out}
#     # Note: set access_token to None in the JSON to avoid duplication; cookie holds token.

# # Accept token from Authorization header OR cookie named access_token
# async def get_current_user(authorization: str = Header(None), access_token: str = Cookie(None)) -> UserOut:
#     token = None
#     if authorization:
#         parts = authorization.split()
#         if len(parts) == 2 and parts[0].lower() == "bearer":
#             token = parts[1]
#     if not token and access_token:
#         token = access_token

#     if not token:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

#     payload = verify_token(token)
#     if not payload:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

#     user = await find_by_id(payload.get("id"))
#     if not user:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

#     return UserOut(
#         id=str(user["_id"]),
#         name=user["name"],
#         email=user["email"],
#         groups=user.get("groups", [])
#     )

# @router.get("/auth/me", response_model=UserOut)
# async def me(current_user = Depends(get_current_user)):
#     return current_user

# @router.post("/auth/logout")
# async def logout(response: Response):
#     is_production = os.getenv("ENVIRONMENT") == "production"
#     response.delete_cookie(
#         "access_token",
#         path="/",
#         httponly=True,
#         secure=is_production,
#         samesite="lax",
#         domain=None
#     )
#     return JSONResponse({"message": "Logged out"})

import os
from fastapi import APIRouter, HTTPException, Depends, Header, status, Cookie, Request
from fastapi.responses import JSONResponse
from ..schemas.user_schema import UserCreate, UserLogin, UserOut
from ..models.user import create_user, find_by_email, find_by_id
from ..utils.hash import hash_password, verify_password
from ..utils.auth import create_access_token, verify_token

router = APIRouter(tags=['auth'])

# Cookie / env config
COOKIE_NAME = os.getenv("ACCESS_COOKIE_NAME", "access_token")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN", None)  # e.g. ".example.com" for prod if needed
COOKIE_PATH = "/"
# For cross-site cookies in production, you usually need samesite='none' and secure=True
SAMESITE_PROD = "none"  # when using secure=True and cross-site
SAMESITE_DEV = "lax"

# ----- Register -----
@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    exists = await find_by_email(user.email)
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed = hash_password(user.password)
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "groups": []
    }
    try:
        uid = await create_user(user_doc)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")

    return {"id": str(uid), "message": "User created"}


# ----- Login -----
@router.post("/auth/login", response_model=dict)
async def login(body: UserLogin):
    db_user = await find_by_email(body.email)
    if not db_user or not verify_password(body.password, db_user["password"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")

    token = create_access_token({"id": str(db_user["_id"]), "email": db_user["email"]})

    # Build response and set cookie on the same response object we'll return
    user_out = {
        "id": str(db_user["_id"]),
        "name": db_user["name"],
        "email": db_user["email"],
        "groups": db_user.get("groups", [])
    }

    resp = JSONResponse(
        content={"access_token": None, "token_type": "bearer", "user": user_out},
        status_code=status.HTTP_200_OK,
    )

    # cookie options: use strict options in prod; in dev use secure=False
    resp.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=IS_PRODUCTION,               # True only in production with HTTPS
        path=COOKIE_PATH,
        domain=COOKIE_DOMAIN,               # None if not set — keep consistent when deleting
        samesite=(SAMESITE_PROD if IS_PRODUCTION else SAMESITE_DEV),
        max_age=60 * 60 * 24 * 7,           # 7 days
        expires=60 * 60 * 24 * 7,
    )

    return resp


# Accept token from Authorization header OR cookie named access_token
async def get_current_user(authorization: str = Header(None), access_token: str = Cookie(None)) -> UserOut:
    token = None
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
    if not token and access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await find_by_id(payload.get("id"))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        groups=user.get("groups", [])
    )


@router.get("/auth/me", response_model=UserOut)
async def me(current_user = Depends(get_current_user)):
    return current_user


# ----- Logout -----
@router.post("/auth/logout")
async def logout(request: Request):
    """
    Return a JSONResponse that contains the Set-Cookie header which deletes the cookie.
    Important: we must delete the cookie on the response object we return.
    """
    # Build response
    resp = JSONResponse({"message": "Logged out"}, status_code=status.HTTP_200_OK)

    # Delete cookie using same name/path/domain/samesite/secure pattern as set_cookie
    # Note: Response.delete_cookie supports key, path, domain — samesite/httponly/secure are not parameters here,
    # so we ensure domain/path match. If you need to be extra explicit, set a cookie with empty value and expires=0.
    if COOKIE_DOMAIN:
        resp.delete_cookie(key=COOKIE_NAME, path=COOKIE_PATH, domain=COOKIE_DOMAIN)
    else:
        resp.delete_cookie(key=COOKIE_NAME, path=COOKIE_PATH)

    # Extra: to be absolutely explicit for some browsers, also set an expired cookie
    # with the same attributes (this will add another Set-Cookie header)
    resp.set_cookie(
        key=COOKIE_NAME,
        value="",
        httponly=True,
        secure=IS_PRODUCTION,
        path=COOKIE_PATH,
        domain=COOKIE_DOMAIN,
        samesite=(SAMESITE_PROD if IS_PRODUCTION else SAMESITE_DEV),
        max_age=0,
        expires=0,
    )

    return resp
