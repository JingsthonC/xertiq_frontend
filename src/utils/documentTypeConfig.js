// Document type display configuration for frontend
export const DOCUMENT_TYPE_CONFIG = {
  DIPLOMA: {
    label: "Diploma",
    shortLabel: "Diploma",
    color: "primary",
    icon: "🎓",
    category: "EDUCATIONAL",
  },
  TRANSCRIPT_OF_RECORDS: {
    label: "Transcript of Records",
    shortLabel: "TOR",
    color: "secondary",
    icon: "📋",
    category: "EDUCATIONAL",
  },
  CERTIFICATE_OF_GRADUATION: {
    label: "Certificate of Graduation",
    shortLabel: "Grad Cert",
    color: "primary",
    icon: "🎖️",
    category: "EDUCATIONAL",
  },
  TRAINING_CERTIFICATE: {
    label: "Training Certificate",
    shortLabel: "Training",
    color: "accent",
    icon: "📚",
    category: "PROFESSIONAL",
  },
  PROFESSIONAL_CERTIFICATE: {
    label: "Professional Certificate",
    shortLabel: "Professional",
    color: "accent",
    icon: "🏅",
    category: "PROFESSIONAL",
  },
  INTERNSHIP_CERTIFICATE: {
    label: "Internship Certificate",
    shortLabel: "Internship",
    color: "secondary",
    icon: "💼",
    category: "WORK_EXPERIENCE",
  },
  OJT_CERTIFICATE: {
    label: "OJT Certificate",
    shortLabel: "OJT",
    color: "secondary",
    icon: "⚙️",
    category: "WORK_EXPERIENCE",
  },
  GOOD_MORAL_CERTIFICATE: {
    label: "Good Moral Certificate",
    shortLabel: "Good Moral",
    color: "primary",
    icon: "✅",
    category: "REFERENCE",
  },
  FORM_137: {
    label: "Form 137 (Permanent Record)",
    shortLabel: "Form 137",
    color: "accent",
    icon: "📄",
    category: "EDUCATIONAL",
  },
  FORM_138: {
    label: "Form 138 (Report Card)",
    shortLabel: "Form 138",
    color: "accent",
    icon: "📊",
    category: "EDUCATIONAL",
  },
  BOARD_CERTIFICATE: {
    label: "Board Certificate",
    shortLabel: "Board Cert",
    color: "primary",
    icon: "🏆",
    category: "PROFESSIONAL",
  },
  PROFESSIONAL_LICENSE: {
    label: "Professional License",
    shortLabel: "License",
    color: "primary",
    icon: "📜",
    category: "PROFESSIONAL",
  },
  CERTIFICATE: {
    label: "Certificate",
    shortLabel: "Certificate",
    color: "primary",
    icon: "📜",
    category: "GENERAL",
  },
};

// Get color classes for Tailwind
export const getColorClasses = (color) => {
  const colorMap = {
    primary: "bg-primary-500/20 text-primary-300 border-primary-500/30",
    secondary: "bg-secondary-500/20 text-secondary-300 border-secondary-500/30",
    accent: "bg-accent-500/20 text-accent-300 border-accent-500/30",
  };
  return colorMap[color] || colorMap.primary;
};

// Get document type configuration
export const getDocTypeConfig = (docType) => {
  return DOCUMENT_TYPE_CONFIG[docType] || DOCUMENT_TYPE_CONFIG.CERTIFICATE;
};

// Create document type badge data helper
export const createDocTypeBadge = (docType, useShortLabel = true) => {
  const config = getDocTypeConfig(docType);
  const colorClass = getColorClasses(config.color);
  const label = useShortLabel ? config.shortLabel : config.label;

  return {
    icon: config.icon,
    label,
    colorClass,
    fullConfig: config,
  };
};
