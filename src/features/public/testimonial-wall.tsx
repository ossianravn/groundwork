import customers from "@/demo/data/public-customers.json"

// Short quotes from fictional teams (MKT-06), set as a wall of equal cards.
export function TestimonialWall() {
  return (
    <section
      className="testimonial-wall public-container"
      aria-labelledby="testimonials-title"
    >
      <div className="public-section-heading">
        <h2 id="testimonials-title">In their words.</h2>
        <p>Sample quotes; the people and teams are fictional.</p>
      </div>
      <ul>
        {customers.testimonials.map((item) => (
          <li key={item.person}>
            <figure>
              <blockquote>
                <p>“{item.text}”</p>
              </blockquote>
              <figcaption>
                <span>{item.person}</span>
                {item.role}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
