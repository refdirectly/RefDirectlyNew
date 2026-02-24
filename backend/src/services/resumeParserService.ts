import pdf from 'pdf-parse';
import mammoth from 'mammoth';

interface ParsedResume {
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  professionalInfo: {
    currentTitle?: string;
    currentCompany?: string;
    experience?: number;
    bio?: string;
  };
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  links: {
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
}

async function extractTextFromBuffer(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
}

function parseResumeText(text: string): ParsedResume {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const result: ParsedResume = {
    personalInfo: {},
    professionalInfo: {},
    skills: [],
    education: [],
    workExperience: [],
    links: {}
  };

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  if (emailMatch) result.personalInfo.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}|\(\d{3}\)[\s-]?\d{3}[\s-]?\d{4}/i);
  if (phoneMatch) result.personalInfo.phone = phoneMatch[0];

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) result.links.linkedIn = 'https://' + linkedinMatch[0];

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) result.links.github = 'https://' + githubMatch[0];

  // Extract name (first non-empty line, likely the name)
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes('@')) {
      result.personalInfo.fullName = firstLine;
    }
  }

  // Extract skills
  const skillsSection = text.match(/skills?[:\s]+([^\n]+(?:\n[^\n]+)*?)(?=\n\n|education|experience|$)/i);
  if (skillsSection) {
    const skillsText = skillsSection[1];
    const commonSkills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'HTML', 'CSS', 'Angular', 'Vue', 'CPP', 'Go', 'Rust', 'Kubernetes', 'Jenkins', 'Agile', 'Scrum'];
    result.skills = commonSkills.map(skill => {
      const displayName = skill === 'CPP' ? 'C++' : skill;
      const searchPattern = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(searchPattern, 'i').test(skillsText) || (skill === 'CPP' && /C\+\+/i.test(skillsText)) ? displayName : null;
    }).filter(Boolean) as string[];
  }

  // Extract experience (years)
  const expMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
  if (expMatch) result.professionalInfo.experience = parseInt(expMatch[1]);

  // Extract location
  const locationMatch = text.match(/(?:location|address)[:\s]+([^\n]+)/i);
  if (locationMatch) result.personalInfo.location = locationMatch[1].trim();

  return result;
}

export async function parseResume(buffer: Buffer, mimetype: string): Promise<ParsedResume> {
  try {
    const text = await extractTextFromBuffer(buffer, mimetype);
    return parseResumeText(text);
  } catch (error: any) {
    throw new Error('Failed to parse resume: ' + error.message);
  }
}
