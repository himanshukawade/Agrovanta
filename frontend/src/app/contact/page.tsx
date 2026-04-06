"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Phone } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

interface Creator {
  name: string;
  github: string;
  linkedin: string;
  phone: string;
}

const creators: Creator[] = [
  {
    name: "Ayushi Hajare",
    github: "#",
    linkedin: "#",
    phone: "+91 xxxxx xxxxx",
  },
  {
    name: "Himanshu Kawade",
    github: "#",
    linkedin: "#",
    phone: "+91 xxxxx xxxxx",
  },
  {
    name: "Vallabh Trivedi",
    github: "#",
    linkedin: "#",
    phone: "+91 xxxxx xxxxx",
  },
  {
    name: "Aryan Yadav",
    github: "#",
    linkedin: "#",
    phone: "+91 xxxxx xxxxx",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Contact = () => {
  const { language } = useLanguage();
  const locale = ["en", "hi", "mr"].includes(language) ? language as "en" | "hi" | "mr" : "en";

  const texts = {
    en: {
      heading: "Meet the",
      headingHighlight: "Creators",
      subtitle: "The team behind Agrovanta dedicated to improving livestock safety and food compliance.",
    },
    hi: {
      heading: "मिलिए",
      headingHighlight: "निर्माताओं से",
      subtitle: "Agrovanta की टीम जो पशुधन सुरक्षा और खाद्य अनुपालन को बेहतर बनाने के लिए प्रतिबद्ध है।",
    },
    mr: {
      heading: "भेटा",
      headingHighlight: "निर्मात्यांना",
      subtitle: "पशुधन सुरक्षा आणि अन्न अनुपालन सुधारण्यासाठी समर्पित Agrovanta ची टीम.",
    },
  }[locale];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
          {texts.heading} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">{texts.headingHighlight}</span>
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          {texts.subtitle}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
      >
        {creators.map((creator) => (
          <motion.div
            key={creator.name}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-emerald-500/50 transition-colors duration-300 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all duration-500" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10 group-hover:border-emerald-400 transition-colors">
                <span className="text-2xl font-bold text-emerald-400">
                  {creator.name.charAt(0)}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                {creator.name}
              </h3>

              <div className="flex gap-4">
                <a
                  href={creator.github}
                  className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300"
                  aria-label="GitHub Profile"
                >
                  <Github size={20} />
                </a>
                <a
                  href={creator.linkedin}
                  className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={`tel:${creator.phone}`}
                  className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300"
                  aria-label="Phone Contact"
                >
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Contact;
