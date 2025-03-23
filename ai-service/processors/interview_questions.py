from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer, util
import random



class InterviewQuestionGenerator:
    def __init__(self):
        self.sentence_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.question_templates = self._load_question_templates()

    def _load_question_templates(self) -> Dict[str, List[Dict[str, str]]]:
        return {
            "technical": [
                {"template": "Pouvez-vous expliquer comment vous utiliseriez {skill} pour résoudre un problème complexe?", 
                 "rationale": "Évaluer la maîtrise technique et l'application pratique"},
                {"template": "Décrivez un projet où vous avez utilisé {skill}. Quels défis avez-vous rencontrés?",
                 "rationale": "Vérifier l'expérience réelle avec la technologie"},
                {"template": "Comment restez-vous à jour avec les évolutions de {skill}?",
                 "rationale": "Évaluer l'engagement pour l'apprentissage continu"},
                {"template": "Quelle est la différence entre {skill} et {alternative_skill} selon vous?",
                 "rationale": "Tester la connaissance comparative des technologies"},
                {"template": "Pouvez-vous expliquer un concept avancé de {skill}?",
                 "rationale": "Évaluer la profondeur de connaissance technique"}
            ],
            "experience": [
                {"template": "Dans votre rôle chez {company}, comment avez-vous contribué à {activity}?",
                 "rationale": "Vérifier les accomplissements concrets"},
                {"template": "Décrivez un défi majeur que vous avez rencontré en tant que {title} et comment vous l'avez surmonté.",
                 "rationale": "Évaluer la résolution de problèmes"},
                {"template": "Comment avez-vous mesuré le succès dans votre rôle de {title}?",
                 "rationale": "Vérifier l'orientation résultats"},
                {"template": "Parlez-moi d'un projet dont vous êtes particulièrement fier dans votre expérience chez {company}.",
                 "rationale": "Identifier les réalisations significatives"},
                {"template": "Comment votre expérience en tant que {title} vous prépare-t-elle pour ce poste?",
                 "rationale": "Évaluer la pertinence de l'expérience"}
            ],
            "soft_skills": [
                {"template": "Décrivez une situation où vous avez dû travailler sous pression pour respecter une deadline.",
                 "rationale": "Évaluer la gestion du stress et des délais"},
                {"template": "Comment gérez-vous les conflits au sein d'une équipe?",
                 "rationale": "Évaluer les compétences relationnelles"},
                {"template": "Parlez-moi d'une situation où vous avez dû convaincre vos collègues d'adopter votre approche.",
                 "rationale": "Évaluer les capacités de persuasion"},
                {"template": "Comment vous adaptez-vous aux changements rapides de priorités?",
                 "rationale": "Évaluer l'adaptabilité"},
                {"template": "Décrivez votre approche pour apprendre une nouvelle technologie rapidement.",
                 "rationale": "Évaluer la capacité d'apprentissage"}
            ],
            "job_specific": [
                {"template": "Comment votre expérience s'aligne-t-elle avec notre besoin de {job_requirement}?",
                 "rationale": "Évaluer l'adéquation au poste spécifique"},
                {"template": "Quelles seraient vos priorités dans les 90 premiers jours à ce poste?",
                 "rationale": "Évaluer la vision et la planification"},
                {"template": "Comment mesureriez-vous votre succès dans ce rôle?",
                 "rationale": "Vérifier la compréhension des objectifs du poste"},
                {"template": "Pourquoi pensez-vous être la personne idéale pour ce poste?",
                 "rationale": "Évaluer la connaissance de soi et la confiance"},
                {"template": "Quels aspects de ce poste vous intéressent le plus?",
                 "rationale": "Évaluer la motivation et l'enthousiasme"}
            ]
        }

    def generate_questions(self, skills: List[str], experiences: List[Any], job_description: str) -> List[Dict[str, str]]:
        questions = []
        if skills:
            tech_questions = self._generate_technical_questions(skills)
            questions.extend(tech_questions)
        if experiences:
            exp_questions = self._generate_experience_questions(experiences)
            questions.extend(exp_questions)
        soft_questions = self._generate_soft_skills_questions()
        questions.extend(soft_questions)
        if job_description:
            job_questions = self._generate_job_specific_questions(job_description)
            questions.extend(job_questions)

        random.shuffle(questions)
        final_questions = []
        tech_qs = [q for q in questions if q.get('category') == 'technical']
        final_questions.extend(tech_qs[:2])
        exp_qs = [q for q in questions if q.get('category') == 'experience']
        final_questions.extend(exp_qs[:2])
        soft_qs = [q for q in questions if q.get('category') == 'soft_skills']
        final_questions.extend(soft_qs[:2])
        job_qs = [q for q in questions if q.get('category') == 'job_specific']
        final_questions.extend(job_qs[:2])
        remaining = [q for q in questions if q not in final_questions]
        final_questions.extend(remaining[:max(0, 10 - len(final_questions))])

        for q in final_questions:
            q.pop('category', None)

        return final_questions[:10]

    def _generate_technical_questions(self, skills: List[str]) -> List[Dict[str, str]]:
        questions = []
        selected_skills = skills[:min(5, len(skills))]
        for skill in selected_skills:
            template_data = random.choice(self.question_templates['technical'])
            alternative_skill = self._find_alternative_skill(skill, skills)
            question_text = template_data['template'].format(
                skill=skill,
                alternative_skill=alternative_skill or "technologies similaires"
            )
            questions.append({
                "question": question_text,
                "rationale": template_data['rationale'],
                "category": "technical"
            })
        return questions

    def _generate_experience_questions(self, experiences: List[Any]) -> List[Dict[str, str]]:
        questions = []
        recent_experiences = experiences[:min(2, len(experiences))]
        for exp in recent_experiences:
            template_data = random.choice(self.question_templates['experience'])
            company = exp.get('company', 'votre précédente entreprise')
            title = exp.get('title', 'votre précédent poste')
            activity = "contribuer aux projets de l'entreprise"
            if exp.get('description'):
                desc = exp.get('description', '')
                activity = desc.split('.')[0] if '.' in desc else desc[:50]
            question_text = template_data['template'].format(
                company=company,
                title=title,
                activity=activity
            )
            questions.append({
                "question": question_text,
                "rationale": template_data['rationale'],
                "category": "experience"
            })
        return questions

    def _generate_soft_skills_questions(self) -> List[Dict[str, str]]:
        selected_templates = random.sample(self.question_templates['soft_skills'], 3)
        questions = [
            {
                "question": template['template'],
                "rationale": template['rationale'],
                "category": "soft_skills"
            }
            for template in selected_templates
        ]
        return questions

    def _generate_job_specific_questions(self, job_description: str) -> List[Dict[str, str]]:
        questions = []
        keywords = self._extract_job_requirements(job_description)
        selected_keywords = random.sample(keywords, min(3, len(keywords)))
        for requirement in selected_keywords:
            template_data = random.choice(self.question_templates['job_specific'])
            question_text = template_data['template'].format(job_requirement=requirement)
            questions.append({
                "question": question_text,
                "rationale": template_data['rationale'],
                "category": "job_specific"
            })
        return questions

    def _find_alternative_skill(self, skill: str, all_skills: List[str]) -> str:
        tech_pairs = {
            "react": ["angular", "vue.js", "svelte"],
            "angular": ["react", "vue.js"],
            "vue.js": ["react", "angular"],
            "python": ["java", "javascript", "c++", "php"],
            "java": ["python", "c++", "c#"],
            "javascript": ["typescript", "python", "php"],
            "typescript": ["javascript", "java", "c#"],
            "node.js": ["django", "flask", "spring", "express"],
            "django": ["flask", "spring", "node.js", "laravel"],
            "sql": ["mongodb", "nosql", "postgresql", "mysql"],
            "mongodb": ["sql", "postgresql", "cassandra"],
            "docker": ["kubernetes", "vagrant", "aws"],
            "aws": ["azure", "gcp", "docker", "kubernetes"],
            "azure": ["aws", "gcp", "openstack"],
            "gcp": ["aws", "azure"],
            "git": ["svn", "mercurial"],
            "agile": ["waterfall", "scrum", "kanban"],
            "scrum": ["kanban", "agile", "waterfall"],
            "devops": ["ci/cd", "mlops", "sre"]
        }
        skill_lower = skill.lower()
        if skill_lower in tech_pairs:
            alternatives = tech_pairs[skill_lower]
            for alt in alternatives:
                if alt in [s.lower() for s in all_skills]:
                    return alt
            return random.choice(alternatives)
        other_skills = [s for s in all_skills if s.lower() != skill_lower]
        if other_skills:
            return random.choice(other_skills)
        return "autres technologies"

    def _extract_job_requirements(self, job_description: str) -> List[str]:
        common_requirements = [
            "développement front-end", "développement back-end", "développement full-stack",
            "développement mobile", "gestion de projet", "travail en équipe",
            "conception de solutions", "architecture logicielle", "agile",
            "analyse de données", "communication", "résolution de problèmes"
        ]
        matched_requirements = [req for req in common_requirements if req.lower() in job_description.lower()]
        if not matched_requirements:
            return random.sample(common_requirements, 3)
        return matched_requirements