from fastapi import HTTPException
from models.user import (
    UserLocal,
    UserOut,
    Hasher
)

def nutzer_verwalten_neu(driver, nutzer: UserLocal):
    with driver.session() as session:
        query = """MATCH (u:user {
                    username: $user_name
                    }) RETURN (u)"""
        result = session.run(query, user_name=nutzer.username)
        nutzervorhanden = result.single()

        if nutzervorhanden:
            raise HTTPException(
                        status_code=403,
                        detail="User existiert bereits",
                    )

        pw_hash = Hasher.get_password_hash(nutzer.password)
        query = """CREATE (u:user {
                        username: $user_name,
                        password: $password,
                        tenant: $tenant
                        }) RETURN (u)"""

        result = session.run(
            query,
            user_name=nutzer.username,
            password=pw_hash,
            tenant=nutzer.tenant,
        )

        neuerNutzer = result.single()
        if neuerNutzer:
            return {
                "message": f"{nutzer.username} angelegt",
                "status_code": 200,
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Nutzer {nutzer.username} anlegen fehlgeschlagen"
            )


def nutzer_verwalten_loeschen(driver, nutzer):
    with driver.session() as session:
        query = """MATCH (u:user {
                    username: $user_name
                    }) RETURN (u)"""
        result = session.run(query, user_name=nutzer.username)
        nutzervorhanden = result.single()

        if nutzervorhanden:
            query = """MATCH (u:user {
                    username: $user_name
                    }) DELETE (u)"""
            result = session.run(query, user_name=nutzer.username)
            return {
                "message": f"{nutzer.username} gelöscht",
                "status_code": 200,
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Nutzer {nutzer.username} löschen fehlgeschlagen"
            )