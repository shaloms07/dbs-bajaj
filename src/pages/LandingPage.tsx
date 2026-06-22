import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import dbsLogo from "../assets/dbs-logo.png";
import bannerImg from "../assets/motor_clp_banner.webp";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Database,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  TrendingUp,
  Cpu,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    document.title = "DBS Driver Behavior Score | Home";
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setShowScrollTop(scrolled > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({ name: "", email: "", message: "" });
      }, 5000);
    }
  };

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "What We Do", href: "#what-we-do" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
    <div className="min-h-screen bg-[#f7f8fc] text-[#10233f] font-sans selection:bg-[#005dac]/20">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#003d81]/10 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src={dbsLogo}
                alt="DBS Logo"
                className="h-16 w-auto object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-[#092C54] ">
                  Driver{" "}
                  <span className="text-[#092C54] font-semibold">
                    Behavior Score
                  </span>
                </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-lg font-bold text-[#4d627e] hover:text-[#005dac] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate("/lookup")}
                  className="bg-[#005dac] hover:bg-[#00478b] text-white font-semibold py-2 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center gap-1.5"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-[#005dac] hover:bg-[#00478b] text-white font-semibold py-2 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#4d627e] hover:text-[#10233f] focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#003d81]/10 px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-medium text-[#4d627e] hover:text-[#005dac] hover:bg-[#f4f7ff] px-3 py-2 rounded-lg transition-all"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-[#003d81]/10">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/lookup");
                  }}
                  className="w-full bg-[#005dac] hover:bg-[#00478b] text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-sm text-center flex items-center justify-center gap-1.5"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full bg-[#005dac] hover:bg-[#00478b] text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-sm text-center"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Custom Deep Blue Gradient */}
      <section
        className="relative pt-28 pb-20 md:pt-36 md:pb-28 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 71, 139, 0.96) 0%, rgba(0, 93, 172, 0.94) 52%, rgba(10, 107, 195, 0.92) 100%)",
        }}
      >
        {/* Glow Effects */}
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-[-10%] w-96 h-96 bg-blue-300/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column (Text copy) */}
            <div className="lg:col-span-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-6">
                <Shield className="w-3.5 h-3.5 text-blue-300" /> Next-Generation
                Telematics Underwriting
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Assess vehicle risk with{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                  real-time score analytics
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg md:text-xl text-blue-100 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Empower your underwriting workforce. Leverage robust driving
                telematics, risk band mapping, and violation tracking in a
                centralized dashboard.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate("/lookup")}
                    className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#005dac] font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 animate-bounce-subtle"
                  >
                    Go to Dashboard{" "}
                    <ArrowRight className="w-5 h-5 text-[#005dac]" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#005dac] font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    Get Started{" "}
                    <ArrowRight className="w-5 h-5 text-[#005dac]" />
                  </button>
                )}
                <a
                  href="#about"
                  className="w-full sm:w-auto text-center border border-white/30 bg-white/5 hover:bg-white/15 text-white font-semibold py-3.5 px-8 rounded-xl shadow-sm transition-all duration-200"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Column (Visual asset and Score panel below) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[480px] lg:max-w-none">
                {/* Visual Frame - Image is bigger */}
                <div className="relative rounded-2xl border border-white/20 bg-white/5 shadow-2xl p-3 backdrop-blur-sm overflow-hidden mb-6">
                  <img
                    src={bannerImg}
                    alt="Driver Analytics Banner"
                    className="rounded-xl w-full h-auto object-cover max-h-[460px] shadow-sm bg-white/5 transition-transform duration-500 hover:scale-102"
                  />
                </div>
                {/* Score panel placed neatly below the image */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl flex items-center justify-between text-white transition-all hover:bg-white/15">
                  <div>
                    <span className="text-xs text-blue-200 block font-medium uppercase tracking-wider">
                      Driver Behaviour Score
                    </span>
                    <span className="text-2xl font-bold text-white">
                      264{" "}
                      <span className="text-sm font-normal text-blue-200">
                        / 300
                      </span>
                    </span>
                  </div>
                  <div className="px-3 py-1.5 text-xs font-bold bg-[#d8f3ea] text-[#0b8666] rounded-full shadow-sm">
                    EXEMPLARY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 bg-white border-t border-[#003d81]/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#005dac]">
              Platform Overview
            </h2>
            <p className="mt-3 text-3xl font-extrabold text-[#10233f] sm:text-4xl">
              Understand vehicle risk metrics in seconds
            </p>
            <p className="mt-4 text-base sm:text-lg text-[#4d627e]">
              Our telematics pipeline translates raw driving behavioral data
              into a clear scoring standard, allowing underwriters to
              confidently quote premiums, inspect violation timelines, and
              manage risk portfolios.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#10233f]">
                Underwrite policies backed by telemetry
              </h3>
              <p className="text-[#4d627e] leading-relaxed">
                Evaluating physical vehicles is only part of the risk equation.
                DBS Driver Behavior Score equips insurance adjusters with
                granular insights into acceleration behavior, deceleration
                events, speed excess, and fatigue signals.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-[#d8f3ea] text-[#0b8666] rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#10233f] font-medium block">
                      Auditable telematics analysis window
                    </strong>
                    <span className="text-sm text-[#4d627e]">
                      Access standard historical data timelines for transparent
                      calculation metrics.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-[#d8f3ea] text-[#0b8666] rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#10233f] font-medium block">
                      Direct Risk Classification
                    </strong>
                    <span className="text-sm text-[#4d627e]">
                      Categorize drivers dynamically between Exemplary, Safe,
                      Moderate, and Extreme Risk bands.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-[#d8f3ea] text-[#0b8666] rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#10233f] font-medium block">
                      Recommended Loading & Discount percentages
                    </strong>
                    <span className="text-sm text-[#4d627e]">
                      Apply dynamic pricing logic directly correlated to
                      behavioral driving analytics.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-[#f4f7ff] rounded-2xl p-8 border border-[#003d81]/10 shadow-inner flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#005dac] text-white rounded-xl shadow-md">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#10233f]">
                    Risk Predictive Analytics
                  </h4>
                  <span className="text-xs text-[#4d627e]">
                    Proprietary Telemetry Intelligence
                  </span>
                </div>
              </div>

              <p className="text-[#4d627e] text-sm leading-relaxed mb-6">
                By aggregating telematics variables over historical periods, we
                model driving behavior profiles that anticipate future accident
                probabilities, leading to lower loss ratios and optimized
                premium rates.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#003d81]/10">
                  <span className="text-2xl font-bold text-[#005dac]">300</span>
                  <span className="text-xs text-[#8493a8] block mt-1">
                    Scale Max Range
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#003d81]/10">
                  <span className="text-2xl font-bold text-[#0b8666]">
                    &lt; 15%
                  </span>
                  <span className="text-xs text-[#8493a8] block mt-1">
                    Loss Ratio Savings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section
        id="what-we-do"
        className="py-20 bg-[#f4f7ff] border-t border-b border-[#003d81]/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#005dac]">
              Key Capabilities
            </h2>
            <p className="mt-3 text-3xl font-extrabold text-[#10233f] sm:text-4xl">
              Innovative tools built for insurance teams
            </p>
            <p className="mt-4 text-base sm:text-lg text-[#4d627e]">
              A complete telemetry toolset to assess vehicle safety scores,
              bulk-upload registries, and review API telemetry logs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-[#003d81]/10 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-[#e7efff] text-[#005dac] rounded-xl w-fit mb-5">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10233f] mb-2">
                Instant Lookup
              </h3>
              <p className="text-sm text-[#4d627e] leading-relaxed">
                Query individual vehicle registrations to pull driving scores,
                historical violation records, and premium recommendation
                modifiers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#003d81]/10 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-[#e7efff] text-[#005dac] rounded-xl w-fit mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10233f] mb-2">
                Portfolio Analytics
              </h3>
              <p className="text-sm text-[#4d627e] leading-relaxed">
                Review distribution percentages across behavior bands, track
                average risk severity, and monitor underwriting trends at scale.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#003d81]/10 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-[#e7efff] text-[#005dac] rounded-xl w-fit mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10233f] mb-2">
                Batch Processing
              </h3>
              <p className="text-sm text-[#4d627e] leading-relaxed">
                Upload lists of vehicle license numbers to process safety score
                analysis, exportable CSV reports, and pricing loadings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#003d81]/10 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-[#e7efff] text-[#005dac] rounded-xl w-fit mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10233f] mb-2">
                Developer Console
              </h3>
              <p className="text-sm text-[#4d627e] leading-relaxed">
                Seamless REST API integration, complete telemetry payload
                schemas, test sandboxes, and authentication token logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#005dac]">
              Our Process
            </h2>
            <p className="mt-3 text-3xl font-extrabold text-[#10233f] sm:text-4xl">
              From telemetry logging to dynamic policy loading
            </p>
            <p className="mt-4 text-base sm:text-lg text-[#4d627e]">
              A streamlined, automated telemetry path designed to help
              underwriting teams secure business with confident decisioning.
            </p>
          </div>

          <div className="relative">
            {/* Step connecting line for desktop */}
            <div className="hidden lg:block absolute top-[55px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-100 via-[#005dac]/20 to-blue-100 z-0" />

            <div className="grid lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="text-center">
                <div className="relative flex items-center justify-center w-14 h-14 bg-white border-2 border-[#005dac]/20 text-[#005dac] rounded-full mx-auto font-bold text-xl shadow-md">
                  1
                </div>
                <h3 className="mt-5 font-bold text-lg text-[#10233f]">
                  Log Telematics
                </h3>
                <p className="mt-2 text-sm text-[#4d627e] max-w-xs mx-auto">
                  Mobile SDKs or vehicle OBD hardware trace speed variance,
                  acceleration rates, and hard braking patterns.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="relative flex items-center justify-center w-14 h-14 bg-[#005dac] text-white rounded-full mx-auto font-bold text-xl shadow-md">
                  2
                </div>
                <h3 className="mt-5 font-bold text-lg text-[#10233f]">
                  Analyze Violations
                </h3>
                <p className="mt-2 text-sm text-[#4d627e] max-w-xs mx-auto">
                  The scoring processor filters noise, matches telemetry events
                  against threshold parameters, and logs severity metrics.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="relative flex items-center justify-center w-14 h-14 bg-white border-2 border-[#005dac]/20 text-[#005dac] rounded-full mx-auto font-bold text-xl shadow-md">
                  3
                </div>
                <h3 className="mt-5 font-bold text-lg text-[#10233f]">
                  Generate Driver Score
                </h3>
                <p className="mt-2 text-sm text-[#4d627e] max-w-xs mx-auto">
                  A standardized 0–300 DBS Driver Score is mapped, outlining
                  risk bands and dynamic premium modifications.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="relative flex items-center justify-center w-14 h-14 bg-[#005dac] text-white rounded-full mx-auto font-bold text-xl shadow-md">
                  4
                </div>
                <h3 className="mt-5 font-bold text-lg text-[#10233f]">
                  Underwrite Policies
                </h3>
                <p className="mt-2 text-sm text-[#4d627e] max-w-xs mx-auto">
                  Log into the console to inspect reporting metrics, download
                  printable PDF audits, and apply premium loadings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section with Custom Deep Blue Gradient */}
      <section
        id="contact"
        className="py-20 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 71, 139, 0.96) 0%, rgba(0, 93, 172, 0.94) 52%, rgba(10, 107, 195, 0.92) 100%)",
        }}
      >
        {/* Glow Effects */}
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-[-10%] w-96 h-96 bg-blue-300/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Contact Support
                </h2>
                <p className="mt-3 text-3xl font-extrabold text-white">
                  Get in touch with telemetry specialists
                </p>
                <p className="mt-4 text-blue-100 leading-relaxed">
                  Have questions about API setups, batch limits, or telematics
                  score indices? Send our developers and product specialists a
                  message.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-white shadow-sm">
                    <Mail className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <span className="text-xs text-blue-200 block font-medium">
                      Email Support
                    </span>
                    <a
                      href="mailto:support@dbs-driver.com"
                      className="text-sm font-semibold text-white hover:text-blue-200 transition-colors"
                    >
                      contact@social-impact.in
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-white shadow-sm">
                    <Phone className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <span className="text-xs text-blue-200 block font-medium">
                      Phone Support
                    </span>
                    <span className="text-sm font-semibold text-white font-medium">
                      +91-98232 76203
                    </span>
                  </div>
                </div>

                {/* <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-white shadow-sm">
                    <MapPin className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <span className="text-xs text-blue-200 block font-medium">HQ Office</span>
                    <span className="text-sm font-semibold text-white font-medium">
                      123 Tech Blvd, San Francisco, CA 94107
                    </span>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Contact Form UI - Crisp white high-contrast card */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#003d81]/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-[#10233f]">
                <h3 className="text-xl font-bold text-[#10233f] mb-6">
                  Send an Inquiry
                </h3>

                {formSubmitted ? (
                  <div className="bg-[#d8f3ea] border border-[#0b8666]/20 text-[#0b8666] rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Inquiry Sent Successfully!</p>
                    <p className="text-sm mt-1 text-[#0b8666]/90">
                      Our telematics support agents will respond to you within
                      one business day.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="form-name"
                          className="block text-xs font-semibold text-[#4d627e] uppercase mb-1.5"
                        >
                          Your Name
                        </label>
                        <input
                          id="form-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Full Name"
                          className="w-full text-sm border border-[#003d81]/10 hover:border-[#003d81]/20 focus:border-[#005dac] rounded-xl p-3 bg-[#f7f8fc] focus:bg-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="form-email"
                          className="block text-xs font-semibold text-[#4d627e] uppercase mb-1.5"
                        >
                          Corporate Email
                        </label>
                        <input
                          id="form-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="email"
                          className="w-full text-sm border border-[#003d81]/10 hover:border-[#003d81]/20 focus:border-[#005dac] rounded-xl p-3 bg-[#f7f8fc] focus:bg-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="form-message"
                        className="block text-xs font-semibold text-[#4d627e] uppercase mb-1.5"
                      >
                        Inquiry Details
                      </label>
                      <textarea
                        id="form-message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="How can our telematics team support your underwriting operations?"
                        className="w-full text-sm border border-[#003d81]/10 hover:border-[#003d81]/20 focus:border-[#005dac] rounded-xl p-3 bg-[#f7f8fc] focus:bg-white outline-none resize-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#005dac] hover:bg-[#00478b] text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    >
                      Submit Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#10233f] text-[#8493a8] border-t border-white/5 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12">
            {/* Branding Column */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={dbsLogo}
                  alt="DBS Logo"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
                <span className="text-lg font-bold tracking-tight text-white ">
                  Driver{" "}
                  <span className="text-white font-semibold">
                    Behavior Score
                  </span>
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Dedicated driver behavior telemetry modeling. Standardizing
                score outputs and helping underwriters protect vehicle risk
                portfolios globally.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
                Quick Navigation
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/login"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Login
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Placeholder Column */}
            {/* <div className="md:col-span-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
                Follow Platforms
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center"
                >
                  LinkedIn
                </a>
                <a
                  href="#"
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center"
                >
                  GitHub
                </a>
              </div>
            </div> */}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              © {new Date().getFullYear()} DBS Driver Behavior Score. All rights
              reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>

      {/* ── Scroll-to-top button with circular progress ring ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'white',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(9,44,84,0.18)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(9,44,84,0.28)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(9,44,84,0.18)';
          }}
        >
          {/* SVG: faint track ring + animated progress ring */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 52 52"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'rotate(-90deg)',
              pointerEvents: 'none',
            }}
          >
            {/* track */}
            <circle
              cx="26" cy="26" r="23"
              fill="none"
              stroke="#092C54"
              strokeWidth="2.5"
              strokeOpacity="0.15"
            />
            {/* progress */}
            <circle
              cx="26" cy="26" r="23"
              fill="none"
              stroke="#092C54"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 23}`}
              strokeDashoffset={`${2 * Math.PI * 23 * (1 - scrollProgress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.12s linear' }}
            />
          </svg>
          {/* Up-arrow icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#092C54"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </>
  );
}
