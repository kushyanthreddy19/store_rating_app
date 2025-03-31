
import { useEffect, useRef } from 'react';
import { Github, ExternalLink } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github?: string;
  live?: string;
}

const Projects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);

  const projects: Project[] = [
    {
      title: "Portfolio Website",
      description: "A personal portfolio website with smooth animations and interactions. Built with React and Tailwind CSS.",
      technologies: ["React", "TailwindCSS", "Framer Motion"],
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      github: "https://github.com/",
      live: "https://example.com"
    },
    {
      title: "E-commerce Platform",
      description: "A full-featured e-commerce platform with product listings, cart functionality, and payment integration.",
      technologies: ["Next.js", "MongoDB", "Stripe"],
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      github: "https://github.com/",
      live: "https://example.com"
    },
    {
      title: "Task Management App",
      description: "A productivity app that helps users organize and track their tasks with intuitive UI and smooth interactions.",
      technologies: ["Vue.js", "Firebase", "Vuetify"],
      image: "https://images.unsplash.com/photo-1611224885990-ab7363d7f2a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      github: "https://github.com/",
      live: "https://example.com"
    }
  ];

  useEffect(() => {
    projectRefs.current = projectRefs.current.slice(0, projects.length);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    projectRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      projectRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [projects.length]);

  return (
    <section id="projects" className="bg-portfolio-cream py-20" ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-heading">
          My <span className="gradient-heading">Projects</span>
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => (projectRefs.current[index] = el)}
              className="project-card opacity-0"
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              <div className="relative mb-4 h-48 overflow-hidden rounded-lg">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold text-portfolio-blue">{project.title}</h3>
              <p className="mb-4 text-portfolio-blue/80">{project.description}</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-portfolio-lightpurple/20 px-3 py-1 text-sm text-portfolio-blue"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex space-x-4">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-portfolio-purple hover:text-portfolio-blue"
                  >
                    <Github className="mr-1 h-5 w-5" /> Code
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-portfolio-purple hover:text-portfolio-blue"
                  >
                    <ExternalLink className="mr-1 h-5 w-5" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
