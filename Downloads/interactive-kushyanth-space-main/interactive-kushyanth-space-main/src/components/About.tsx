
import { useEffect, useRef } from 'react';

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (imageRef.current) {
              imageRef.current.classList.add('animate-fade-in-left');
              imageRef.current.classList.remove('opacity-0');
            }
            if (contentRef.current) {
              contentRef.current.classList.add('animate-fade-in-right');
              contentRef.current.classList.remove('opacity-0');
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="about" className="bg-white py-20" ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-heading">
          About <span className="gradient-heading">Me</span>
        </h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div ref={imageRef} className="flex items-center justify-center opacity-0">
            <div className="relative h-[350px] w-[350px] overflow-hidden rounded-full bg-gradient-to-br from-portfolio-purple to-portfolio-lightpurple p-1 shadow-xl">
              <div className="h-full w-full rounded-full bg-portfolio-cream flex items-center justify-center">
                <span className="text-5xl font-bold gradient-heading">KR</span>
              </div>
            </div>
          </div>

          <div ref={contentRef} className="flex flex-col justify-center opacity-0">
            <h3 className="mb-4 text-2xl font-bold text-portfolio-blue">
              Kushyanth Reddy
            </h3>
            <p className="mb-6 text-lg text-portfolio-blue/80">
            Aspiring Data Engineer & Full-Stack Developer with a strong foundation in AI, Data Science, and Software
Development. Proficient in building scalable data pipelines, integrating AI models, and developing end -to-end
software solutions. Passionate about leveraging Python, SQL, and Machine Learning to drive innovation and
solve real-world problems. Excited to contribute to cutting -edge Data Engineering, NLP, and Generative AI
projects that impact global supply chains.
            </p>
            <p className="mb-6 text-lg text-portfolio-blue/80">
              I specialize in creating responsive websites and applications that not only look
              great but also provide intuitive user experiences. I love working with modern
              technologies and am constantly learning to stay at the forefront of web development.
            </p>
            <div className="mt-6">
              <a
                href="#contact"
                className="btn-primary inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
