import spacy
from sentence_transformers import SentenceTransformer, util
import torch
from typing import List, Tuple, Set

class SkillMatcher:
    def __init__(self):
        self.nlp = spacy.load("fr_core_news_md")
        self.sentence_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

    def match_skills(self, candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str]) -> Tuple[List[str], List[str], int]:
        if not required_skills:
            return candidate_skills, [], 100

        candidate_skills_standardized = [skill.lower().strip() for skill in candidate_skills]
        required_skills_standardized = [skill.lower().strip() for skill in required_skills]
        preferred_skills_standardized = [skill.lower().strip() for skill in preferred_skills] if preferred_skills else []

        matched_required = set()
        exact_matched_skills = []

        for req_skill in required_skills_standardized:
            for candidate_skill in candidate_skills_standardized:
                if req_skill == candidate_skill or req_skill in candidate_skill or candidate_skill in req_skill:
                    matched_required.add(req_skill)
                    exact_matched_skills.append(candidate_skill)

        remaining_required = [skill for skill in required_skills_standardized if skill not in matched_required]
        remaining_candidate = [skill for skill in candidate_skills_standardized if skill not in exact_matched_skills]

        semantic_matched_skills = []
        if remaining_required and remaining_candidate:
            semantic_matches = self._semantic_match(remaining_candidate, remaining_required)
            for candidate_skill, matches in semantic_matches.items():
                if matches:
                    semantic_matched_skills.append(candidate_skill)
                    for matched_skill, _ in matches:
                        matched_required.add(matched_skill)

        matched_skills = list(set(exact_matched_skills + semantic_matched_skills))
        missing_skills = [skill for skill in required_skills if skill.lower() not in matched_required]

        matched_preferred = set()
        for pref_skill in preferred_skills_standardized:
            for candidate_skill in candidate_skills_standardized:
                if pref_skill == candidate_skill or pref_skill in candidate_skill or candidate_skill in pref_skill:
                    matched_preferred.add(pref_skill)
                    break
            if pref_skill not in matched_preferred and remaining_candidate:
                semantic_matches = self._semantic_match([pref_skill], remaining_candidate)
                if semantic_matches.get(pref_skill, []):
                    matched_preferred.add(pref_skill)

        required_match_percentage = (len(matched_required) / len(required_skills_standardized)) * 100 if required_skills_standardized else 100
        preferred_bonus = 0
        if preferred_skills_standardized:
            preferred_match_percentage = (len(matched_preferred) / len(preferred_skills_standardized)) * 15
            preferred_bonus = preferred_match_percentage
        match_score = min(100, int(required_match_percentage + preferred_bonus))

        return matched_skills, missing_skills, match_score

    def _semantic_match(self, source_skills: List[str], target_skills: List[str], threshold: float = 0.75) -> dict:
        if not source_skills or not target_skills:
            return {}
        source_embeddings = self.sentence_model.encode(source_skills)
        target_embeddings = self.sentence_model.encode(target_skills)
        similarities = util.cos_sim(source_embeddings, target_embeddings)
        matches = {}
        for i, source_skill in enumerate(source_skills):
            skill_matches = []
            for j, target_skill in enumerate(target_skills):
                similarity = similarities[i][j].item()
                if similarity >= threshold:
                    skill_matches.append((target_skill, similarity))
            matches[source_skill] = sorted(skill_matches, key=lambda x: x[1], reverse=True)
        return matches