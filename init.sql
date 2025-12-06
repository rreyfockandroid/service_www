CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sections (title, content, slug, order_num) VALUES
('O nas', 'Witamy na naszej stronie! Jesteśmy firmą z pasją do technologii i innowacji. Nasze doświadczenie pozwala nam tworzyć rozwiązania, które naprawdę działają.', 'o-nas', 1),
('Usługi', 'Oferujemy szeroki wachlarz usług IT: tworzenie aplikacji webowych, mobilnych, systemy zarządzania, konsultacje technologiczne i wiele więcej.', 'uslugi', 2),
('Portfolio', 'Przez lata zrealizowaliśmy dziesiątki projektów dla klientów z różnych branż. Nasza praca mówi sama za siebie - sprawdź nasze realizacje!', 'portfolio', 3),
('Kontakt', 'Skontaktuj się z nami! Chętnie odpowiemy na wszystkie pytania i pomożemy w realizacji Twojego projektu.', 'kontakt', 4);