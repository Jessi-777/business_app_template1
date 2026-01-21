import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-20 py-16 flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold text-white mb-6 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          About Us
        </h1>
        <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed">
          Welcome to Human Nature Athletica (HNA)! We bring humanity and nature together through
          our unique athletic and lifestyle apparel. Every piece is designed to make you feel
          connected to the world around you, whether on the track, in the studio, on the farm or in everyday life.
        </p>
      </div>

      {/* Mission / Story Section */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Our Mission</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            Our mission is to merge style, comfort, and sustainability in every garment.
            We aim to empower people to live actively while respecting and honoring the natural world.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Our Story</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            Founded with a passion for human potential and the beauty of nature, HNA combines
            innovative athletic wear with eco-conscious materials. Our designs reflect harmony,
            creativity, and authenticity.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <p className="text-white/70 mb-6 text-lg">
          Join us on our journey and explore our collections!
        </p>
        <a
          href="/shop"
          className="inline-block px-10 py-4 font-bold rounded-xl text-black bg-white hover:bg-white/90 shadow-lg shadow-white/20 hover:shadow-white/40 hover:scale-105 transition-all duration-300"
        >
          Visit Shop
        </a>
      </div>
    </div>
  );
}
