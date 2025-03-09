export const mockData = {
  users: {
    currentUser: {
      id: 1,
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@example.com",
      role: "Admin",
      companyName: "RecrutPME SARL"
    }
  },
  
  
  dashboardStats: {
    analyzedCVs: 42,
    analyzedCVsPercentChange: 15,
    qualifiedCandidates: 18,
    qualifiedCandidatesPercentChange: 22,
    scheduledInterviews: 8,
    scheduledInterviewsPercentChange: 33,
    timeToHire: 21,
    timeToHireChange: -3
  },
  
  recentCandidates: [
    {
      id: "c1",
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      phone: "06 12 34 56 78",
      title: "Développeuse Full Stack",
      skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
      score: 92
    },
    {
      id: "c2",
      firstName: "Thomas",
      lastName: "Bernard",
      email: "t.bernard@example.com",
      phone: "06 23 45 67 89",
      title: "UX Designer",
      skills: ["Figma", "Adobe XD", "Sketch", "UI Design", "Prototyping"],
      score: 78
    },
    {
      id: "c3",
      firstName: "Sophie",
      lastName: "Petit",
      email: "sophie.p@example.com",
      phone: "07 34 56 78 90",
      title: "Data Scientist",
      skills: ["Python", "R", "Machine Learning", "SQL", "Pandas"],
      score: 85
    }
  ],
  
  sourcesData: [
    { id: "s1", name: "LinkedIn", percentage: 45, color: "#4A6FDC" },
    { id: "s2", name: "Indeed", percentage: 25, color: "#2164F3" },
    { id: "s3", name: "Website", percentage: 15, color: "#12B7B3" },
    { id: "s4", name: "Referrals", percentage: 10, color: "#7A56CF" },
    { id: "s5", name: "Other", percentage: 5, color: "#F8C12C" }
  ],
  
  jobs: [
    { id: 1, title: "Développeur Full Stack", status: "ACTIVE", location: "Paris", jobType: "CDI", department: "Tech", createdAt: "2025-01-15T10:00:00", salaryRange: "45-55K€" },
    { id: 2, title: "UX Designer", status: "ACTIVE", location: "Lyon", jobType: "CDI", department: "Design", createdAt: "2025-01-20T10:00:00", salaryRange: "40-50K€" },
    { id: 3, title: "Data Scientist", status: "ACTIVE", location: "Marseille", jobType: "CDI", department: "Data", createdAt: "2025-02-01T10:00:00", salaryRange: "48-60K€" }
  ],
  
  jobDetail: {
    id: 1,
    title: "Développeur Full Stack",
    description: "Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe produit...",
    requiredSkills: ["React", "Node.js", "JavaScript", "MongoDB", "TypeScript", "Git", "Docker", "AWS"],
    preferredSkills: ["GraphQL", "Jest", "Redux", "Webpack"],
    location: "Paris",
    jobType: "CDI",
    minYearsExperience: 3,
    salaryRange: "45-55K€",
    department: "Tech",
    status: "ACTIVE",
    createdAt: "2025-01-15T10:00:00",
    updatedAt: "2025-01-15T10:00:00"
  },
  
  candidateDetail: {
    id: "c1",
    firstName: "Marie",
    lastName: "Martin",
    email: "marie.martin@example.com",
    phone: "06 12 34 56 78",
    title: "Développeuse Full Stack",
    yearsOfExperience: 5,
    skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "TypeScript", "HTML", "CSS", "Git"],
    score: 92,
    requiredSkillsMatch: 8,
    requiredSkillsTotal: 10,
    preferredSkillsMatch: 5,
    preferredSkillsTotal: 6,
    
    experience: [
      {
        title: "Développeuse Full Stack Senior",
        company: "TechInnovate",
        location: "Paris",
        startDate: "2019",
        endDate: "Présent",
        description: "Développement d'applications web utilisant React, Node.js et MongoDB.\nMise en place d'une architecture microservices.\nGestion d'une équipe de 3 développeurs."
      },
      {
        title: "Développeuse Front-end",
        company: "WebSolutions",
        location: "Lyon",
        startDate: "2017",
        endDate: "2019",
        description: "Développement d'interfaces utilisateur avec React et Redux.\nOptimisation des performances des applications web.\nIntégration d'API RESTful."
      }
    ],
    
    education: [
      {
        degree: "Master en Informatique",
        institution: "Université de Paris",
        location: "Paris",
        startYear: "2015",
        endYear: "2017"
      },
      {
        degree: "Licence en Informatique",
        institution: "Université Lyon 1",
        location: "Lyon",
        startYear: "2012",
        endYear: "2015"
      }
    ],
    
    requiredSkillsAnalysis: [
      { name: "React", matched: true, confidence: 95 },
      { name: "Node.js", matched: true, confidence: 90 },
      { name: "JavaScript", matched: true, confidence: 98 },
      { name: "MongoDB", matched: true, confidence: 85 },
      { name: "TypeScript", matched: true, confidence: 88 },
      { name: "Git", matched: true, confidence: 92 },
      { name: "Docker", matched: false, confidence: 40 },
      { name: "AWS", matched: false, confidence: 30 }
    ],
    
    preferredSkillsAnalysis: [
      { name: "GraphQL", matched: true, confidence: 80 },
      { name: "Jest", matched: true, confidence: 85 },
      { name: "Redux", matched: true, confidence: 90 },
      { name: "Webpack", matched: false, confidence: 45 }
    ],
    
    experienceInsights: [
      "Progression de carrière visible avec évolution vers un rôle senior.",
      "Expérience solide dans le développement full stack avec React et Node.js.",
      "Expérience de management d'équipe.",
      "Parcours professionnel cohérent avec le poste visé."
    ],
    
    educationInsights: [
      "Formation supérieure de niveau Bac+5 en informatique.",
      "Parcours académique en adéquation avec le poste visé."
    ],
    
    strengths: [
      "Excellente maîtrise des technologies front-end et back-end modernes.",
      "Expérience éprouvée dans le développement d'applications web complexes.",
      "Capacité à diriger des équipes techniques.",
      "Parcours professionnel axé sur les technologies demandées."
    ],
    
    areasForImprovement: [
      "Expérience limitée avec les technologies de containerisation comme Docker.",
      "Connaissance limitée des services cloud AWS.",
      "Pourrait bénéficier d'une expérience plus approfondie en DevOps."
    ],
    
    jobFitAnalysis: "Cette candidate présente une excellente adéquation avec le poste. Elle possède 8/10 compétences requises et 5/6 compétences souhaitées. Avec 5 ans d'expérience professionnelle, la candidate dispose d'une solide expérience dans le domaine du développement web full stack. Son parcours montre une évolution de carrière constante et des responsabilités croissantes.\n\nRecommandation: Cette candidate mérite d'être contactée rapidement pour un entretien approfondi.",
    
    categoryScores: [
      { name: "Compétences techniques", score: 90 },
      { name: "Expérience pertinente", score: 85 },
      { name: "Formation", score: 80 },
      { name: "Soft skills", score: 75 }
    ],
    
    interviewQuestions: [
      {
        question: "Pouvez-vous décrire un projet complexe où vous avez utilisé React et Node.js ensemble?",
        rationale: "Évaluer l'expérience pratique avec les technologies clés"
      },
      {
        question: "Comment gérez-vous l'optimisation des performances dans une application React?",
        rationale: "Vérifier les connaissances techniques approfondies"
      },
      {
        question: "Parlez-moi de votre expérience de gestion d'équipe chez TechInnovate.",
        rationale: "Évaluer les compétences de leadership"
      },
      {
        question: "Comment abordez-vous l'apprentissage de nouvelles technologies?",
        rationale: "Évaluer la capacité d'adaptation et d'apprentissage"
      }
    ],
    
    notes: [
      {
        authorInitials: "JD",
        authorName: "Jean Dupont",
        date: "2025-02-15T14:30:00",
        type: "Entretien",
        content: "Excellente candidate, très à l'aise techniquement. À poursuivre avec un entretien technique approfondi."
      }
    ]
  },
  
  analyzedCandidates: [
    {
      id: "c1",
      firstName: "Marie",
      lastName: "Martin",
      skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
      yearsOfExperience: 5,
      score: 92
    },
    {
      id: "c2",
      firstName: "Thomas",
      lastName: "Bernard",
      skills: ["Figma", "Adobe XD", "Sketch", "UI Design", "Prototyping"],
      yearsOfExperience: 3,
      score: 78
    },
    {
      id: "c3",
      firstName: "Sophie",
      lastName: "Petit",
      skills: ["Python", "R", "Machine Learning", "SQL", "Pandas"],
      yearsOfExperience: 4,
      score: 85
    },
    {
      id: "c4",
      firstName: "Lucas",
      lastName: "Dubois",
      skills: ["JavaScript", "Vue.js", "CSS", "HTML", "REST API"],
      yearsOfExperience: 2,
      score: 65
    }
  ],
  
  analyzedStats: {
    skillsDetected: 25,
    recommendedCandidates: 2,
    topCandidateName: "Marie Martin",
    topCandidateScore: 92
  },
  
  interviews: [
    {
      id: 1,
      candidateId: "c1",
      candidateName: "Marie Martin",
      jobId: 1,
      jobTitle: "Développeur Full Stack",
      interviewType: "TECHNICAL",
      scheduledTime: "2025-03-15T10:00:00",
      duration: 60,
      status: "SCHEDULED"
    },
    {
      id: 2,
      candidateId: "c2",
      candidateName: "Thomas Bernard",
      jobId: 2,
      jobTitle: "UX Designer",
      interviewType: "CULTURAL",
      scheduledTime: "2025-03-16T14:00:00",
      duration: 45,
      status: "SCHEDULED"
    }
  ],
  
  interviewDetail: {
    id: 1,
    candidateId: "c1",
    candidateName: "Marie Martin",
    candidateEmail: "marie.martin@example.com",
    candidatePhone: "06 12 34 56 78",
    jobId: 1,
    jobTitle: "Développeur Full Stack",
    interviewType: "TECHNICAL",
    scheduledTime: "2025-03-15T10:00:00",
    duration: 60,
    location: "Visioconférence",
    interviewers: ["Jean Dupont", "Sarah Legrand"],
    notes: "Préparer des questions techniques spécifiques à React et Node.js",
    status: "SCHEDULED",
    createdAt: "2025-02-20T14:30:00",
    updatedAt: "2025-02-20T14:30:00"
  },
  
  talentPool: [
    {
      id: "c1",
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      title: "Développeuse Full Stack",
      skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
      lastContact: "2025-02-15",
      status: "QUALIFIED"
    },
    {
      id: "c3",
      firstName: "Sophie",
      lastName: "Petit",
      email: "sophie.p@example.com",
      title: "Data Scientist",
      skills: ["Python", "R", "Machine Learning", "SQL", "Pandas"],
      lastContact: "2025-02-10",
      status: "QUALIFIED"
    }
  ],
  
  reports: {
    hiringActivity: [
      { month: "Janvier", applicants: 120, interviews: 35, offers: 10, hires: 5 },
      { month: "Février", applicants: 145, interviews: 42, offers: 12, hires: 7 }
    ],
    timeToHire: {
      average: 21,
      byDepartment: [
        { department: "Tech", days: 19 },
        { department: "Marketing", days: 24 },
        { department: "Finance", days: 28 },
        { department: "Design", days: 17 }
      ]
    },
    sources: [
      { source: "LinkedIn", candidates: 65, percentage: 45 },
      { source: "Indeed", candidates: 36, percentage: 25 },
      { source: "Site Web", candidates: 22, percentage: 15 },
      { source: "Recommandations", candidates: 14, percentage: 10 },
      { source: "Autres", candidates: 7, percentage: 5 }
    ]
  }
};
