import PageHead from '../components/PageHead.jsx';
import SplitText from '../components/SplitText.jsx';
import Btn from '../components/Btn.jsx';
import Barcode from '../components/Barcode.jsx';

const AIMS = [
  'Turn Japanese design and automotive performance into wearable art.',
  'Unite the community where JDM style meets street fashion.',
  'Deliver meticulously detailed apparel that honors culture and craft.',
];

export default function About() {
  return (
    <div className="page about">
      <PageHead eyebrow="About" title="Our" accent="Story" jp="ストーリー">
        <p>Premium streetwear born from car culture.</p>
      </PageHead>

      <section className="wrap about-hero" data-reveal="clip">
        <img src="/images/lookbook/hilux-day.jpg" alt="A Lowcal crew member beside a white Toyota Hilux" />
        <div className="about-hero-tag">
          <span className="mono">Where it started</span>
          <Barcode value="ABOUT" width={120} height={24} />
        </div>
      </section>

      <section className="section wrap about-intro">
        <p className="about-big" data-reveal>
          Built for the ones who live for <span className="red">clean stance</span>, honest machines and the people who gather around them.
        </p>
        <div className="about-cols">
          <div data-reveal>
            <span className="mono muted">How we build</span>
            <p>Durability, comfort, stand-out style. Every seam checked before it leaves our hands.</p>
          </div>
          <div data-reveal style={{ '--d': 120 }}>
            <span className="mono muted">Who we build for</span>
            <p>Not customers. The crew. Every order is handed over in person.</p>
          </div>
        </div>
      </section>

      <section className="section about-mv">
        <div className="wrap about-mv-grid">
          <article data-reveal>
            <span className="mono red">01</span>
            <h2 className="display"><SplitText text="Mission" /></h2>
            <p>Authentic, high-quality apparel that fuses clean Japanese design with the raw energy of car culture.</p>
          </article>
          <article data-reveal style={{ '--d': 140 }}>
            <span className="mono red">02</span>
            <h2 className="display"><SplitText text="Vision" /></h2>
            <p>The international brand where Japanese cultural reverence and automotive passion are worn as modern style.</p>
          </article>
        </div>
      </section>

      <section className="section wrap about-aims">
        <h2 className="display section-title"><SplitText text="We aim" /> <SplitText text="to" className="red" delay={150} /></h2>
        <ol>
          {AIMS.map((a, i) => (
            <li key={a} data-reveal style={{ '--d': i * 100 }}>
              <span className="display aims-n">0{i + 1}</span>
              <p>{a}</p>
            </li>
          ))}
        </ol>
        <div data-reveal><Btn to="/shop" variant="red">Wear the story</Btn></div>
      </section>
    </div>
  );
}
