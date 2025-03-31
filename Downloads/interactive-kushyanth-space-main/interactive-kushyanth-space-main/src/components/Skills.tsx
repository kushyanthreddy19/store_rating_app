
import { useEffect, useRef } from 'react';

interface Skill {
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'tools';
}

const Skills = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<(HTMLDivElement | null)[]>([]);

  const skills: { category: string; items: Skill[] }[] = [
    {
      category: 'Frontend',
      items: [
        { name: 'HTML/CSS', level: 90, category: 'frontend' },
        { name: 'JavaScript', level: 85, category: 'frontend' },
        { name: 'React', level: 80, category: 'frontend' },
        { name: 'TailwindCSS', level: 85, category: 'frontend' },
        { name: 'TypeScript', level: 75, category: 'frontend' },
      ],
    },
    {
      category: 'Backend',
      items: [
        { name: 'Node.js', level: 75, category: 'backend' },
        { name: 'Express', level: 70, category: 'backend' },
        { name: 'MongoDB', level: 65, category: 'backend' },
        { name: 'Firebase', level: 70, category: 'backend' },
      ],
    },
    {
      category: 'Tools & Others',
      items: [
        { name: 'Git', level: 80, category: 'tools' },
        { name: 'VS Code', level: 90, category: 'tools' },
        { name: 'Figma', level: 70, category: 'tools' },
        { name: 'Responsive Design', level: 85, category: 'tools' },
      ],
    },
  ];

  useEffect(() => {
    categoriesRef.current = categoriesRef.current.slice(0, skills.length);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    categoriesRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      categoriesRef.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [skills.length]);

  return (
    <section id="skills" className="bg-white py-20" ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-heading">
          My <span className="gradient-heading">Skills</span>
        </h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              ref={(el) => (categoriesRef.current[categoryIndex] = el)}
              className="rounded-xl bg-portfolio-cream p-6 shadow-md opacity-0"
              style={{ animationDelay: `${0.2 * categoryIndex}s` }}
            >
              <h3 className="mb-6 text-xl font-bold text-portfolio-blue">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.items.map((skill, skillIndex) => (
                  <div key={skillIndex}>
                    <div className="mb-1 flex justify-between">
                      <span className="font-medium text-portfolio-blue">{skill.name}</span>
                      <span className="text-sm text-portfolio-blue/70">{skill.level}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-portfolio-purple to-portfolio-lightpurple"
                        style={{
                          width: `${skill.level}%`,
                          transition: 'width 1s ease-in-out',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
