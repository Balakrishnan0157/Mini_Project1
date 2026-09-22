const db = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  // 1. Seed Default Users if none exist
  const users = db.getCollection('users');
  if (users.length === 0) {
    console.log('🌱 Seeding default users...');
    const adminPasswordHash = bcrypt.hashSync('Admin@12345', 10);
    const studentPasswordHash = bcrypt.hashSync('Student@12345', 10);

    db.insert('users', {
      name: 'System Admin',
      email: 'admin@careerguide.ai',
      password_hash: adminPasswordHash,
      role: 'admin',
      phone: '9999999999',
      education_level: 'Graduation',
      city: 'Mumbai',
      marks_10th: 95.0,
      marks_12th: 92.0,
      stream: 'Science'
    });

    db.insert('users', {
      name: 'Rahul Sharma',
      email: 'student@example.com',
      password_hash: studentPasswordHash,
      role: 'student',
      phone: '9876543210',
      education_level: '12th',
      city: 'Mumbai',
      marks_10th: 85.0,
      marks_12th: 82.0,
      stream: 'Science (PCM)'
    });
  }

  // 2. Seed Careers if none exist
  const careers = db.getCollection('careers');
  if (careers.length === 0) {
    console.log('🌱 Seeding initial career pathways...');
    const INITIAL_CAREERS = [
      {
        slug: "btech-cse",
        title: "B.Tech Computer Science & Engineering (CSE)",
        category: "Computer Science & IT",
        overview: "Core engineering discipline covering software engineering, algorithms, database systems, networking, and computing theory.",
        required_education: "12th Science (PCM)",
        eligibility: "12th Pass with Physics, Chemistry, Maths (Min 60%) + JEE / Entrance score",
        course_duration: "4 Years",
        entrance_exams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE"],
        important_skills: ["Data Structures", "Algorithms", "Full-Stack Web Dev", "System Design"],
        favourite_subjects: ["Mathematics", "Computer Science"],
        career_opportunities: ["Software Engineer", "Systems Architect", "Cloud Engineer", "Backend Developer"],
        salary_fresher: "₹6 - ₹18 LPA",
        salary_experienced: "₹20 - ₹50+ LPA",
        future_scope: "Continuous high global demand across tech giants, startups, and enterprises.",
        popularity_score: 99
      },
      {
        slug: "mbbs",
        title: "MBBS (Bachelor of Medicine, Bachelor of Surgery)",
        category: "Medical & Healthcare",
        overview: "Primary professional undergraduate medical degree for aspiring doctors, training in clinical diagnosis, surgery, and pharmacology.",
        required_education: "12th Science (PCB)",
        eligibility: "12th Pass with Physics, Chemistry & Biology (Min 50%) + NEET UG score",
        course_duration: "5.5 Years",
        entrance_exams: ["NEET UG"],
        important_skills: ["Diagnosis", "Patient Care", "Empathy", "Anatomy"],
        favourite_subjects: ["Biology", "Chemistry"],
        career_opportunities: ["General Physician", "Surgeon", "Medical Officer", "Clinical Researcher"],
        salary_fresher: "₹6 - ₹10 LPA",
        salary_experienced: "₹15 - ₹35+ LPA",
        future_scope: "High demand globally with opportunities for MD/MS specialization.",
        popularity_score: 98
      },
      {
        slug: "ai-ml-engineer",
        title: "Artificial Intelligence & Machine Learning (AI/ML)",
        category: "Computer Science & IT",
        overview: "Specialization in building autonomous systems, neural networks, computer vision, and large language models (LLMs).",
        required_education: "12th Science (PCM)",
        eligibility: "12th Pass with PCM (Min 60%) + Engineering Entrance",
        course_duration: "4 Years",
        entrance_exams: ["JEE Main", "BITSAT", "VITEEE"],
        important_skills: ["Python", "TensorFlow / PyTorch", "Linear Algebra", "Deep Learning"],
        favourite_subjects: ["Mathematics", "Statistics", "Computer Science"],
        career_opportunities: ["AI Research Scientist", "ML Engineer", "NLP Engineer"],
        salary_fresher: "₹8 - ₹22 LPA",
        salary_experienced: "₹25 - ₹65+ LPA",
        future_scope: "Top priority field globally powering the AI revolution.",
        popularity_score: 97
      },
      {
        slug: "chartered-accountant",
        title: "Chartered Accountant (CA)",
        category: "Commerce & Finance",
        overview: "Premier accounting qualification managing financial auditing, taxation, corporate finance, and governance.",
        required_education: "12th (Commerce or Any)",
        eligibility: "12th Pass (Min 50%) + CA Foundation Clearance",
        course_duration: "4.5 Years",
        entrance_exams: ["CA Foundation", "CA Intermediate", "CA Final"],
        important_skills: ["Auditing", "Taxation (GST)", "Financial Analysis", "Corporate Law"],
        favourite_subjects: ["Accountancy", "Economics", "Mathematics"],
        career_opportunities: ["Chartered Accountant", "Statutory Auditor", "Tax Consultant", "CFO"],
        salary_fresher: "₹8 - ₹15 LPA",
        salary_experienced: "₹20 - ₹50+ LPA",
        future_scope: "Indispensable in corporate compliance and financial management.",
        popularity_score: 94
      },
      {
        slug: "ui-ux-designer",
        title: "UI/UX Designer & Product Designer",
        category: "Design & Creative",
        overview: "Focuses on user research, wireframing, interactive prototyping, and designing digital product interfaces.",
        required_education: "12th (Any Stream) or B.Des",
        eligibility: "12th Pass + Portfolio / NID or UCEED Entrance",
        course_duration: "4 Years",
        entrance_exams: ["UCEED", "NID DAT", "NIFT Entrance"],
        important_skills: ["Figma / Sketch", "User Research", "Wireframing", "Visual Design"],
        favourite_subjects: ["Design", "Psychology", "Computer Science"],
        career_opportunities: ["UI/UX Designer", "Product Designer", "User Researcher"],
        salary_fresher: "₹5 - ₹10 LPA",
        salary_experienced: "₹15 - ₹32 LPA",
        future_scope: "Critical role for every software product, app, and web startup.",
        popularity_score: 93
      },
      {
        slug: "civil-services-ias",
        title: "Civil Services Officer (IAS / IPS / IFS)",
        category: "Government Services",
        overview: "Prestigious administrative and policing leadership roles serving the nation through public policy execution.",
        required_education: "Graduation (Any Stream)",
        eligibility: "Bachelor's Degree in any discipline + Age 21 to 32 years",
        course_duration: "1 - 2 Years Prep",
        entrance_exams: ["UPSC Civil Services Examination (Prelims, Mains, Interview)"],
        important_skills: ["Administrative Governance", "Policy Formulation", "Public Communication"],
        favourite_subjects: ["Polity", "History", "Economics"],
        career_opportunities: ["District Magistrate (IAS)", "Superintendent of Police (IPS)", "Diplomat (IFS)"],
        salary_fresher: "₹8 - ₹12 LPA + Perks",
        salary_experienced: "₹18 - ₹30 LPA + Perks",
        future_scope: "Highest social impact and administrative governance roles in India.",
        popularity_score: 98
      }
    ];

    for (const c of INITIAL_CAREERS) {
      db.insert('careers', c);
    }
  }

  // 3. Seed Colleges if none exist
  const colleges = db.getCollection('colleges');
  if (colleges.length === 0) {
    console.log('🌱 Seeding college directory...');
    const INITIAL_COLLEGES = [
      { name: "IIT Bombay", city: "Mumbai", state: "Maharashtra", type: "Government", courses: ["B.Tech CSE", "B.Tech AI"], fees: "₹2.5 Lakhs / yr", rating: 4.9, website: "https://www.iitb.ac.in" },
      { name: "AIIMS New Delhi", city: "New Delhi", state: "Delhi", type: "Government", courses: ["MBBS", "B.Sc Nursing"], fees: "₹1,628 / yr", rating: 5.0, website: "https://www.aiims.edu" },
      { name: "NLSIU Bengaluru", city: "Bengaluru", state: "Karnataka", type: "Government", courses: ["BA LLB (Hons)", "LLM"], fees: "₹3.5 Lakhs / yr", rating: 4.9, website: "https://www.nls.ac.in" },
      { name: "BITS Pilani", city: "Pilani", state: "Rajasthan", type: "Private", courses: ["B.E. Computer Science", "B.Pharm"], fees: "₹5.5 Lakhs / yr", rating: 4.8, website: "https://www.bits-pilani.ac.in" },
      { name: "NID Ahmedabad", city: "Ahmedabad", state: "Gujarat", type: "Government", courses: ["B.Des UI/UX"], fees: "₹3.8 Lakhs / yr", rating: 4.8, website: "https://www.nid.edu" }
    ];

    for (const col of INITIAL_COLLEGES) {
      db.insert('colleges', col);
    }
  }
}

module.exports = seedDatabase;
