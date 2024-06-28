import openpyxl
import random
import faker

FAKER = faker.Faker("es-ES")

COURT_NUMBER = 6
EXAMS = [
    ("ALE", "Alemán", "Alemany", False),
    ("ING", "Inglés", "Anglés", True),
    ("ARE", "Artes Escénicas", "Arts Escèniques", False),
    ("BIO", "Biología", "Biologia", False),
    ("CAS", "Castellano", "Castellà", True),
    ("CUA", "Cultura Audiovisual", "Cultura Audiovisual", False),
    ("DTE", "Dibujo Técnico", "Dibuix Tècnic", False),
    ("DIS", "Diseño", "Disseny", False),
    ("ECO", "Economía de la Empresa", "Economia de l’Empresa", False),
    ("FIS", "Física", "Física", False),
    ("FRA", "Francés", "Francés", False),
    ("FAR", "Fundamentos del Arte II", "Fonaments de l’Art II", False),
    ("GEO", "Geografía", "Geografia", False),
    ("GEL", "Geología", "Geologia", False),
    ("GRI", "Griego", "Grec", False),
    ("HES", "Historia de España", "Història d’Espanya", True),
    ("HFI", "Historia de la Filosofía", "Història de la Filosofia", False),
    ("HAR", "Historia del Arte", "Història de l’Art", False),
    ("ITA", "Italiano", "Italià", False),
    ("LAT", "Llatí II", "Latín II", False),
    ("MCS", "Matemáticas Aplicadas a las Ciencias Sociales II", "Matemàtiques Aplicades a les Ciències Socials II", False),
    ("MAT", "Matemáticas II", "Matemàtiques II", False),
    ("QUI", "Química", "Química", False),
    ("VAL", "Valenciano", "Valencià", True),
]
CENTRES = [
    "COL. CALASANCIO",
    "COL. EL VALLE",
    "COL. SAN AGUSTIN",
    "IES ENRIC VALOR (EL CAMPELLO)",
    "IES LA FOIA",
    "IES PLAYA DE SAN JUAN",
    "IES POETA PACO MOLLA",
]
STUDENT_ORIGINS = [
    "B", "F"
]
USED_NIFS = []

def generate_spanish_nif():
    while True:
        # Generate a random NIF number (8 digits)
        nif_number = ''.join([str(random.randint(0, 9)) for _ in range(8)])
        
        # Calculate the control letter (DNI letter) for the NIF
        control_letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
        control_index = int(nif_number) % 23
        control_letter = control_letters[control_index]
        
        # Combine the NIF number and the control letter
        nif = nif_number + control_letter
        if nif not in USED_NIFS:
            USED_NIFS.append(nif)
            return nif

def obligatory_examns():
    return filter(lambda exam: exam[3], EXAMS)

def voluntary_examns():
    return filter(lambda exam: not exam[3], EXAMS)

def exam_type(exam):
    return "Obligatoria" if exam[3] else "Voluntaria"

def choose_voluntary_exams(total_exams: int):
    voluntary = list(voluntary_examns())
    exams = []
    choosen = []
    while total_exams > 0:
        exam = random.choice(voluntary)
        if exam[0] not in choosen:
            exams.append(exam)
            choosen.append(exam[0])
            total_exams -= 1
    return exams

def generate_student(total_exams: int):
    student_name = FAKER.first_name()
    student_last_name = FAKER.last_name()
    student_nif = generate_spanish_nif()
    student_origin = random.choice(STUDENT_ORIGINS)
    student_centre = random.choice(CENTRES)

    student_examns = [
        exam for exam in EXAMS if exam[3]
    ]

    if len(student_examns) < total_exams:
        student_examns = student_examns + choose_voluntary_exams(total_exams - len(student_examns))

    return sorted(map(lambda exam: [
        COURT_NUMBER,
        exam[1],
        student_last_name,
        student_name,
        student_nif,
        exam[2],
        exam_type(exam),
        student_origin,
        student_centre,
    ], student_examns), key = lambda student_exam: student_exam[1])


workbook = openpyxl.Workbook()
worksheet = workbook.active

worksheet.append([
        "Num tribunal",
        "Descripción materia castellano",
        "Apellidos alumno",
        "Nombre alumno",
        "NIF alumno",
        "Descripción materia valenciano",
        "Tipo de materia",
        "Origen del alumno",
        "Nombre centro"
    ])

for _ in range(random.randint(280, 370)):
    for exam in generate_student(random.randint(4, 8)):
        worksheet.append(exam)

workbook.save("out.xlsx")