from typing import List, Dict, Any
import spacy
from sentence_transformers import SentenceTransformer
from datetime import datetime

import re
from pypdf import PdfReader  # Pour les PDF
from docx import Document  # Pour les fichiers Word
import io

class CVProcessor:
    def __init__(self):
        self.nlp = spacy.load("fr_core_news_md")
        self.sentence_model = SentenceTransformer('paraphrase-MiniLM-L3-v2')

    def extract_information(self, content: bytes, file_extension: str) -> Dict[str, Any]:
        # Déterminer le type de fichier à partir de l'extension
        text = self._extract_text(content, file_extension)

        doc = self.nlp(text)
        extracted_info = {
            "full_name": "",
            "email": "",
            "phone": "",
            "experience": [],
            "education": [],
            "skills": [],
            "years_of_experience": 0
        }

        # Extraction du nom
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                extracted_info["full_name"] = ent.text
                break

        # Extraction de l'email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            extracted_info["email"] = email_match.group()

        # Extraction du numéro de téléphone
        phone_pattern = r'(\+\d{1,3}\s?)?(\d{1,4}[\s.-]?){3}\d{1,4}'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            extracted_info["phone"] = phone_match.group()

        # Extraction des compétences
        extracted_info["skills"] = self.extract_skills(text, doc)

        # Extraction de l'expérience
        extracted_info["experience"] = self.extract_experience(text)

        # Extraction de la formation
        extracted_info["education"] = self.extract_education(text)

        # Calcul des années d'expérience
        total_years = sum(
            (exp.get("end_date", datetime.now().year) - exp.get("start_date", 0))
            for exp in extracted_info["experience"]
            if isinstance(exp.get("start_date"), int) and isinstance(exp.get("end_date"), (int, str))
        )
        extracted_info["years_of_experience"] = total_years

        return extracted_info

    def _extract_text(self, content: bytes, file_extension: str) -> str:
        if file_extension.lower() == '.pdf':
            # Extraction de texte à partir d'un PDF
            reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
        elif file_extension.lower() in ['.doc', '.docx']:
            # Extraction de texte à partir d'un fichier Word
            doc = Document(io.BytesIO(content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        else:
            raise ValueError(f"Unsupported file extension: {file_extension}")

    # Le reste du fichier (extract_skills, extract_experience, etc.) reste inchangé
    def extract_skills(self, text: str, doc: Any) -> List[str]:
        tech_skills = [
            "Python", "Java", "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js",
            "Django", "Flask", "Spring", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Docker",
            "Kubernetes", "AWS", "Azure", "GCP", "Git", "Agile", "Scrum", "DevOps", "REST", "GraphQL"
        ]

        skills = []
        text_lower = text.lower()

        for skill in tech_skills:
            if skill.lower() in text_lower:
                skills.append(skill)

        for token in doc:
            if token.pos_ in ["NOUN", "PROPN"] and token.text.lower() in [s.lower() for s in tech_skills]:
                if token.text not in skills:
                    skills.append(token.text)

        return list(set(skills))

    def extract_experience(self, text: str) -> List[Dict]:
        experiences = []
        experience_section = []
        lines = text.split('\n')
        in_experience_section = False

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(keyword in line.lower() for keyword in ['expérience', 'expériences professionnelles', 'work experience']):
                in_experience_section = True
                continue
            
            if in_experience_section:
                if any(keyword in line.lower() for keyword in ['formation', 'éducation', 'education', 'compétences', 'skills']):
                    break
                experience_section.append(line)

        current_exp = {}
        description_lines = []

        for line in experience_section:
            date_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4}|présent|present)', line, re.IGNORECASE)
            if date_match:
                if current_exp:
                    current_exp["description"] = "\n".join(description_lines).strip()
                    experiences.append(current_exp)
                    current_exp = {}
                    description_lines = []

                start_date = int(date_match.group(1))
                end_date = date_match.group(2)
                end_date = int(end_date) if end_date.isdigit() else "présent"

                title_and_company = line[:date_match.start()].strip()
                parts = title_and_company.split(',')
                title = parts[0].strip() if parts else title_and_company
                company = parts[1].strip() if len(parts) > 1 else "Entreprise inconnue"

                current_exp = {
                    "title": title,
                    "company": company,
                    "start_date": start_date,
                    "end_date": end_date
                }
            else:
                description_lines.append(line)

        if current_exp:
            current_exp["description"] = "\n".join(description_lines).strip()
            experiences.append(current_exp)

        return experiences

    def extract_education(self, text: str) -> List[Dict]:
        education = []
        education_section = []
        lines = text.split('\n')
        in_education_section = False

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(keyword in line.lower() for keyword in ['formation', 'éducation', 'education']):
                in_education_section = True
                continue
            
            if in_education_section:
                if any(keyword in line.lower() for keyword in ['compétences', 'skills', 'expérience']):
                    break
                education_section.append(line)

        for line in education_section:
            date_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4})', line)
            if date_match:
                start_year = int(date_match.group(1))
                end_year = int(date_match.group(2))

                institution_and_degree = line[:date_match.start()].strip()
                parts = institution_and_degree.split(',')
                degree = parts[0].strip() if parts else institution_and_degree
                institution = parts[1].strip() if len(parts) > 1 else "Institution inconnue"

                education.append({
                    "degree": degree,
                    "institution": institution,
                    "start_year": start_year,
                    "end_year": end_year
                })

        return education

    def calculate_match_score(self, extracted_info: Dict, job_description: str) -> float:
        job_embedding = self.sentence_model.encode(job_description)
        cv_text = " ".join([
            " ".join(extracted_info["skills"]),
            " ".join([exp.get("description", "") for exp in extracted_info["experience"]]),
            " ".join([edu.get("degree", "") for edu in extracted_info["education"]])
        ])
        cv_embedding = self.sentence_model.encode(cv_text)

        similarity = util.cos_sim(job_embedding, cv_embedding)[0][0].item()
        return similarity * 100

    def generate_insights(self, extracted_info: Dict, required_skills: List[str], preferred_skills: List[str], job_description: str) -> Dict[str, List[str]]:
        insights = {
            "strengths": [],
            "weaknesses": [],
            "experience_insights": [],
            "education_insights": []
        }

        insights["strengths"] = self.identify_strengths(extracted_info, required_skills, preferred_skills, job_description)
        insights["weaknesses"] = self.identify_weaknesses(extracted_info, required_skills, preferred_skills, job_description)
        insights["experience_insights"] = self.generate_experience_insights(extracted_info["experience"])
        insights["education_insights"] = self.generate_education_insights(extracted_info["education"])

        return insights

    def identify_strengths(self, extracted_info: Dict, required_skills: List[str], preferred_skills: List[str], job_description: str) -> List[str]:
        strengths = []
        extracted_skills_lower = [skill.lower() for skill in extracted_info["skills"]]

        matched_required = sum(1 for skill in required_skills if skill.lower() in extracted_skills_lower)
        if matched_required / len(required_skills) >= 0.8:
            strengths.append(f"Correspondance élevée avec les compétences requises ({matched_required}/{len(required_skills)} compétences clés).")

        matched_preferred = sum(1 for skill in preferred_skills if skill.lower() in extracted_skills_lower)
        if matched_preferred > len(preferred_skills) * 0.5:
            strengths.append(f"Possède plusieurs compétences complémentaires souhaitées ({matched_preferred}/{len(preferred_skills)}).")

        years_exp = extracted_info.get("years_of_experience", 0)
        if years_exp >= 5:
            strengths.append(f"Expérience professionnelle significative ({years_exp} ans).")

        while len(strengths) < 3:
            generic_strengths = [
                "Profil bien structuré avec des compétences techniques claires.",
                "Expérience pertinente dans des rôles similaires.",
                "Progression professionnelle cohérente.",
                "Compétences solides.",
                "Capacité d'adaptation à différents contextes professionnels."
            ]
            for strength in generic_strengths:
                if strength not in strengths:
                    strengths.append(strength)
                    break
                if len(strengths) >= 3:
                    break

        return strengths[:5]

    def identify_weaknesses(self, extracted_info: Dict, required_skills: List[str], preferred_skills: List[str], job_description: str) -> List[str]:
        weaknesses = []
        extracted_skills_lower = [skill.lower() for skill in extracted_info["skills"]]

        missing_required = [skill for skill in required_skills if skill.lower() not in extracted_skills_lower]
        if missing_required:
            if len(missing_required) > len(required_skills) * 0.5:
                weaknesses.append(f"Plusieurs compétences requises non mentionnées dans le CV ({', '.join(missing_required[:3])}).")
            else:
                weaknesses.append(f"Quelques compétences requises non explicitement mentionnées ({', '.join(missing_required)}).")

        years_exp = extracted_info.get("years_of_experience", 0)
        if years_exp < 2:
            weaknesses.append("Expérience professionnelle limitée dans le domaine.")

        missing_preferred = [skill for skill in preferred_skills if skill.lower() not in extracted_skills_lower]
        if missing_preferred and len(missing_preferred) > len(preferred_skills) * 0.7:
            weaknesses.append(f"Manque de compétences complémentaires souhaitées.")

        while len(weaknesses) < 2:
            generic_weaknesses = [
                "Le CV pourrait mieux détailler les accomplissements concrets.",
                "Expérience dans des entreprises de taille différente.",
                "Peu d'informations sur la participation à des projets d'équipe.",
                "Possibilité d'approfondir certaines compétences techniques spécifiques."
            ]
            for weakness in generic_weaknesses:
                if weakness not in weaknesses:
                    weaknesses.append(weakness)
                    break
                if len(weaknesses) >= 2:
                    break

        return weaknesses[:3]

    def generate_experience_insights(self, experiences: List[Dict]) -> List[str]:
        insights = []
        if not experiences:
            insights.append("Aucune expérience professionnelle détaillée dans le CV.")
            return insights

        if len(experiences) >= 2:
            recent_title = experiences[0].get('title', '').lower()
            previous_title = experiences[1].get('title', '').lower()
            if 'senior' in recent_title and 'senior' not in previous_title:
                insights.append("Progression de carrière visible avec promotion à un poste senior.")
            if 'lead' in recent_title or 'manager' in recent_title or 'responsable' in recent_title:
                insights.append("Évolution vers des responsabilités managériales.")

        longest_experience = max(experiences, key=lambda x: int(x.get('end_date', datetime.now().year)) - int(x.get('start_date', 0)) if x.get('start_date') else 0)
        duration = int(longest_experience.get('end_date', datetime.now().year)) - int(longest_experience.get('start_date', 0)) if longest_experience.get('start_date') else 0
        if duration >= 3:
            insights.append(f"Stabilité professionnelle démontrée avec {duration} ans chez {longest_experience.get('company', 'un employeur')}.")

        industries = set()
        for exp in experiences:
            company = exp.get('company', '').lower()
            for industry in ['tech', 'finance', 'santé', 'éducation', 'média', 'retail', 'consulting']:
                if industry in company or industry in exp.get('description', '').lower():
                    industries.add(industry)
        if industries:
            insights.append(f"Expérience dans les secteurs: {', '.join(industries)}.")

        if len(experiences) >= 3:
            insights.append("Parcours diversifié avec de multiples expériences professionnelles.")

        has_gaps = False
        for i in range(1, len(experiences)):
            current_start = int(experiences[i].get('start_date', 0))
            previous_end = int(experiences[i-1].get('end_date', 0)) if experiences[i-1].get('end_date') != 'présent' else datetime.now().year
            if current_start - previous_end > 1 and previous_end > 0 and current_start > 0:
                has_gaps = True
                break
        if has_gaps:
            insights.append("Présence de périodes d'inactivité dans le parcours professionnel.")

        if len(insights) < 3:
            generic_insights = [
                "Spécialisation progressive visible à travers le parcours professionnel.",
                "Expérience acquise dans des environnements professionnels variés.",
                "Parcours cohérent avec le poste visé."
            ]
            for insight in generic_insights:
                if insight not in insights:
                    insights.append(insight)
                if len(insights) >= 4:
                    break

        return insights

    def generate_education_insights(self, education: List[Dict]) -> List[str]:
        insights = []
        if not education:
            insights.append("Aucune formation détaillée dans le CV.")
            return insights

        higher_ed_keywords = ["master", "mastère", "mba", "ingénieur", "doctorat", "phd", "bac+5"]
        has_higher_ed = any(any(keyword in edu.get('degree', '').lower() for keyword in higher_ed_keywords) for edu in education)
        if has_higher_ed:
            insights.append("Formation supérieure de niveau Bac+5 ou plus.")

        prestigious_schools = ["polytechnique", "centrale", "mines", "hec", "essec", "edhec", "dauphine", "sorbonne", "sciences po"]
        prestigious_matches = []
        for edu in education:
            institution = edu.get('institution', '').lower()
            for school in prestigious_schools:
                if school in institution:
                    prestigious_matches.append(edu.get('institution', ''))
        if prestigious_matches:
            insights.append(f"Formation dans {prestigious_matches[0]}, établissement renommé.")

        tech_fields = ["informatique", "développement", "numérique", "données", "computer science", "engineering", "tech"]
        has_tech_education = any(any(field in edu.get('degree', '').lower() for field in tech_fields) for edu in education)
        if has_tech_education:
            insights.append("Formation spécialisée dans le domaine technique/informatique.")

        recent_education = any(int(edu.get('end_year', 0)) >= datetime.now().year - 5 for edu in education if edu.get('end_year', '').isdigit())
        if recent_education:
            insights.append("Formation récente, moins de 5 ans.")

        if len(insights) < 2:
            generic_insights = [
                "Parcours académique en adéquation avec le poste visé.",
                "Combinaison de formations théoriques et pratiques.",
                "Formation initiale complétée par des expériences professionnelles pertinentes."
            ]
            for insight in generic_insights:
                if insight not in insights:
                    insights.append(insight)
                if len(insights) >= 3:
                    break

        return insights