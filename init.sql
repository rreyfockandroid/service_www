CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    section_id INTEGER REFERENCES sections(id),
    level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sections (title, content, slug, order_num) VALUES
('Strona główna', 'Witaj w serwisie poświęconym fizyce! Znajdziesz tu materiały zgodne z podstawą programową dla szkół podstawowych i średnich w Polsce. Odkryj fascynujący świat fizyki - od podstawowych praw ruchu po tajemnice kwantów.', 'strona-glowna', 1),
('Szkoła podstawowa', 'Podstawy fizyki dla klas 7-8. Dowiedz się o ruchu, energii, elektryczności i magnetyzmie w sposób przystępny i ciekawy. Materiały zgodne z podstawą programową MEN.', 'szkola-podstawowa', 2),
('Szkoła średnia', 'Zaawansowane zagadnienia fizyki dla szkół średnich. Mechanika, termodynamika, elektryczność, optyka, fizyka atomowa i współczesna. Przygotowanie do matury i olimpiad.', 'szkola-srednia', 3),
('Artykuły', 'Baza wiedzy - artykuły pogrupowane według dziedzin fizyki. Każdy artykuł zawiera wyjaśnienia, wzory i przykłady dostosowane do poziomu nauczania.', 'artykuly', 4),
('Kontakt', 'Masz pytania? Potrzebujesz wyjaśnienia trudnego zagadnienia? Skontaktuj się z nami - chętnie pomożemy!', 'kontakt', 5);

INSERT INTO users (username, password_hash, is_admin) VALUES
('admin', '$2b$12$yhTdUyaQ25iNSVp0EOARSuq90FbWVig1GtkYNfhyxIVyVzMCxqODS', true);

INSERT INTO articles (title, content, slug, section_id, level) VALUES
('Ruch jednostajny prostoliniowy', 'Ruch jednostajny prostoliniowy to ruch, w którym ciało porusza się po linii prostej ze stałą prędkością. Prędkość definiujemy jako stosunek przebytej drogi do czasu: v = s/t. W ruchu jednostajnym prostoliniowym prędkość nie zmienia się - ciało pokonuje równe odległości w równych odstępach czasu. Przykłady: samochód jadący autostradą ze stałą prędkością 100 km/h, pocisk kosmiczny poruszający się w próżni.', 'ruch-jednostajny', 2, 'podstawowa'),

('Siła i masa', 'Masa to miara bezwładności ciała - im większa masa, tym trudniej zmienić stan ruchu ciała. Siła to wielkość fizyczna, która może zmienić stan ruchu lub kształt ciała. Jednostką siły jest niuton [N]. Według II zasady dynamiki Newtona: F = m·a, gdzie F to siła, m to masa, a to przyspieszenie. Jedna z najważniejszych sił to siła ciężkości: Fc = m·g, gdzie g ≈ 10 m/s².', 'sila-masa', 2, 'podstawowa'),

('Energia kinetyczna i potencjalna', 'Energia kinetyczna to energia ruchu: Ek = ½mv². Im szybciej porusza się ciało i im większą ma masę, tym większa jest jego energia kinetyczna. Energia potencjalna grawitacji zależy od wysokości: Ep = mgh. Ciało na wysokości ma zapas energii, który może przekształcić w ruch. Zasada zachowania energii mówi, że energia nie znika, tylko przechodzi z jednej formy w drugą.', 'energia', 2, 'podstawowa'),

('Prąd elektryczny i opór', 'Prąd elektryczny to uporządkowany ruch ładunków elektrycznych. Natężenie prądu I mierzy się w amperach [A]. Napięcie U (mierzone w woltach [V]) jest przyczyną przepływu prądu. Opór elektryczny R (w omach [Ω]) utrudnia przepływ prądu. Prawo Ohma: U = I·R. Im większy opór, tym mniejszy prąd przy tym samym napięciu.', 'prad-elektryczny', 2, 'podstawowa'),

('Magnetyzm', 'Magnesy mają dwa bieguny: północny (N) i południowy (S). Bieguny jednoimienne odpychają się, różnoimienne przyciągają. Wokół magnesu istnieje pole magnetyczne. Prąd elektryczny też wytwarza pole magnetyczne - to elektromagnetyzm. Silnik elektryczny i generator to urządzenia wykorzystujące zjawiska elektromagnetyczne.', 'magnetyzm', 2, 'podstawowa'),

('Kinematyka - ruch ze zmienną prędkością', 'Przyspieszenie to szybkość zmiany prędkości: a = Δv/Δt. W ruchu jednostajnie przyspieszonym ciało zwiększa prędkość o stałą wartość w jednostce czasu. Podstawowe wzory: v = v₀ + at, s = v₀t + ½at², v² = v₀² + 2as. Swobodny spadek to ruch jednostajnie przyspieszony z przyspieszeniem g ≈ 9,81 m/s². Rzut poziomy i ukośny to połączenie ruchu jednostajnego i jednostajnie przyspieszonego.', 'kinematyka', 3, 'srednia'),

('Dynamika - zasady dynamiki Newtona', 'I zasada: ciało pozostaje w spoczynku lub ruchu jednostajnym prostoliniowym, jeśli nie działa na nie siła zewnętrzna (zasada bezwładności). II zasada: F = ma - przyspieszenie jest wprost proporcjonalne do siły i odwrotnie proporcjonalne do masy. III zasada: każdej akcji towarzyszy równa co do wartości, ale przeciwnie skierowana reakcja. Siła tarcia: T = μN, gdzie μ to współczynnik tarcia, N to siła nacisku.', 'dynamika', 3, 'srednia'),

('Praca i moc', 'Praca mechaniczna: W = F·s·cosα, gdzie α to kąt między siłą a przemieszczeniem. Jednostka: dżul [J]. Moc to szybkość wykonywania pracy: P = W/t = F·v. Jednostka: wat [W]. Sprawność: η = Wużyteczna/Wcałkowita. Energia mechaniczna: Em = Ek + Ep. W układzie zachowawczym energia mechaniczna jest stała.', 'praca-moc', 3, 'srednia'),

('Termodynamika', 'Pierwsza zasada termodynamiki: ΔU = Q - W (zmiana energii wewnętrznej = ciepło dostarczone - praca wykonana przez układ). Ciepło właściwe: Q = mcΔT. Przemiana izotermiczna (T=const), izobaryczna (p=const), izochoryczna (V=const), adiabatyczna (Q=0). Silnik cieplny: η = W/Qp = 1 - Qo/Qp. Cykl Carnota ma największą sprawność: η = 1 - Tz/Tg.', 'termodynamika', 3, 'srednia'),

('Fale mechaniczne i dźwięk', 'Fala to rozchodzące się zaburzenie. Długość fali λ, okres T, częstotliwość f = 1/T. Prędkość fali: v = λf. Fale poprzeczne (drgania prostopadle do kierunku rozchodzenia) i podłużne (równolegle). Dźwięk to fala podłużna o częstotliwości 20 Hz - 20 kHz. Natężenie dźwięku: I = P/S [W/m²]. Poziom natężenia: L = 10 log(I/I₀) [dB]. Zjawiska falowe: odbicie, załamanie, dyfrakcja, interferencja.', 'fale', 3, 'srednia'),

('Optyka geometryczna', 'Prawo odbicia: kąt padania = kąt odbicia. Prawo załamania (Snella): n₁sinα = n₂sinβ. Zwierciadło płaskie: obraz pozorny, tej samej wielkości. Zwierciadło kuliste: 1/f = 1/x + 1/y (równanie zwierciadła). Soczewka cienka: podobne równanie. Soczewka skupiająca (f>0), rozpraszająca (f<0). Mikroskop i teleskop to układy soczewek.', 'optyka', 3, 'srednia'),

('Elektryczność i magnetyzm', 'Prawo Coulomba: F = k·q₁q₂/r². Natężenie pola: E = F/q. Potencjał: V = W/q. Pojemność kondensatora: C = Q/U. Energia: E = ½CU². Obwody: szeregowo R = R₁+R₂, równolegle 1/R = 1/R₁+1/R₂. Prawo Ampera, indukcja magnetyczna B, siła Lorentza: F = qvB. Prawo indukcji Faradaya: ε = -dΦ/dt. Transformator: U₁/U₂ = N₁/N₂.', 'elektromagnetyzm', 3, 'srednia'),

('Fizyka atomowa', 'Model atomu Rutherforda-Bohra. Widmo wodoru, serie spektralne. Promieniotwórczość: rozpad α, β, γ. Prawo rozpadu: N = N₀·e^(-λt). Okres połowicznego rozpadu: T½ = ln2/λ. Energia wiązania jądra. Synteza i rozszczepienie jąder. E = mc² - równoważność masy i energii.', 'fizyka-atomowa', 3, 'srednia'),

('Fizyka kwantowa', 'Dualizm korpuskularno-falowy. Hipoteza de Broglie''a: λ = h/p. Zasada nieoznaczoności Heisenberga: Δx·Δp ≥ h/4π. Zjawisko fotoelektryczne: Ek(max) = hf - W. Efekt Comptona. Funkcja falowa i równanie Schrödingera. Liczby kwantowe. Zakaz Pauliego.', 'fizyka-kwantowa', 3, 'srednia'),

('Teoria względności', 'Szczególna teoria względności: postulaty Einsteina. Dylatacja czasu: Δt = γΔt₀. Kontrakcja długości: L = L₀/γ, gdzie γ = 1/√(1-v²/c²). Relatywistyczna energia kinetyczna: Ek = (γ-1)mc². Energia spoczynkowa: E₀ = mc². Energia całkowita: E² = (pc)² + (mc²)². Ogólna teoria względności: grawitacja jako zakrzywienie czasoprzestrzeni.', 'relatywistyka', 3, 'srednia');