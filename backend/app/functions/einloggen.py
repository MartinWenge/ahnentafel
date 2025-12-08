from fastapi import HTTPException
from models.user import UserIn, UserOut, Hasher
from utility.security import create_access_token


def einloggen(driver, user: UserIn):
    with driver.session() as session:
        query = """MATCH (u:user {
                                username: $user_name
                                }) RETURN (u)"""
        result = session.run(query, user_name=user.username)
        db_user = result.single()
        dict_db_user = dict(db_user["u"])
        db_user_pw = dict_db_user["password"]

        if Hasher.verify_password(user.password, db_user_pw):
            tenantDB = dict_db_user["tenant"]
            access_token = create_access_token(data={"tenant": tenantDB})
            validated_user = UserOut(
                username=dict_db_user["username"], tenant=tenantDB, token=access_token
            )
            return validated_user
        else:
            raise HTTPException(
                status_code=401,
                detail="Login fehlgeschlagen",
            )
