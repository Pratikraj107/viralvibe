import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Viral Posts in Seconds
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Generate on-brand Twitter and LinkedIn content with real-time research and AI. Turn ideas into ready-to-post content and visuals instantly.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="px-6 h-12 inline-flex items-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white">Get Started</Link>
          <Link href="/app" className="px-6 h-12 inline-flex items-center rounded-md border border-gray-300 bg-white text-gray-700">Try the Generator</Link>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[{
            title: 'Research-backed', desc: 'Pulls fresh context from the web for credible posts.'
          },{
            title: 'Multi-variant ideas', desc: 'Get 3–4 drafts per platform to choose from.'
          },{
            title: 'One-click visuals', desc: 'Generate matching post images instantly.'
          }].map((f, i) => (
            <div key={i} className="p-6 rounded-xl border bg-white/80 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}