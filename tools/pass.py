from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- 1. Generowanie hash'a hasła ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# --- 2. Weryfikacja hasła ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# --- PRZYKŁAD DZIAŁANIA ---
if __name__ == "__main__":
    # Użytkownik podaje hasło przy rejestracji
    password = "admin123"

    # Hashowanie hasła
    hashed = hash_password(password)
    print("Hashed:", hashed)

    # Weryfikacja (np. przy logowaniu)
    is_correct = verify_password("MojeSuperTajneHaslo123", hashed)
    print("Poprawne hasło?", is_correct)

    is_incorrect = verify_password("zleHaslo", hashed)
    print("Złe hasło?", is_incorrect)