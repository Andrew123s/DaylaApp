import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Users, Calendar, Check, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Compass className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dayla
              </span>
            </div>
            
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Plan Your Adventures Together
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Dayla makes collaborative trip planning simple and fun. Create, share, and manage your travel plans with friends and family in real-time.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center">
                  Get Started Free
                </Link>
                <a href="#how-it-works" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center">
                  Learn More
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.pexels.com/photos/7412069/pexels-photo-7412069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Trip planning" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Perfect Trips</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dayla combines all the essential tools for seamless travel planning in one beautiful platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MapPin className="h-8 w-8 text-blue-600" />}
              title="Interactive Planning Board"
              description="Collaborate in real-time with sticky notes, media sharing, and interactive planning tools."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-green-600" />}
              title="Smart Scheduling"
              description="Organize your itinerary with our visual calendar and smart event management system."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-purple-600" />}
              title="Real-time Collaboration"
              description="See who's online, what they're working on, and chat with your travel companions."
            />
            <FeatureCard 
              icon={<Compass className="h-8 w-8 text-orange-600" />}
              title="Sus Cal & Smart Pak"
              description="Track your carbon footprint and create intelligent packing lists tailored to your trip."
            />
            <FeatureCard 
              icon={<Check className="h-8 w-8 text-red-600" />}
              title="Budget Management"
              description="Track expenses, split costs, and settle payments directly within the app."
            />
            <FeatureCard 
              icon={<ArrowRight className="h-8 w-8 text-indigo-600" />}
              title="Community & Sharing"
              description="Share your experiences and discover new destinations from fellow travelers."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Dayla Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and plan your next adventure with ease.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Create Your Trip"
              description="Set up your trip with dates, destination, and invite your travel companions."
            />
            <StepCard 
              number="2"
              title="Plan Together"
              description="Collaborate in real-time to build your perfect itinerary and manage expenses."
            />
            <StepCard 
              number="3"
              title="Enjoy Your Journey"
              description="Access your plans on the go, track your sustainability goals, and share memories."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of happy travelers who plan better trips with Dayla.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Dayla transformed how we plan our family vacations. The real-time collaboration is a game-changer!"
              author="Sarah Johnson"
              role="Family Traveler"
              image="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=120"
            />
            <TestimonialCard 
              quote="As a digital nomad, I love how Dayla helps me track my carbon footprint while planning my next destination."
              author="Miguel Sanchez"
              role="Digital Nomad"
              image="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120"
            />
            <TestimonialCard 
              quote="The budget management feature saved our friendship! No more arguments about who owes what after the trip."
              author="Emily Chen"
              role="Group Traveler"
              image="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works for your travel style.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Free"
              price="$0"
              description="Perfect for occasional travelers"
              features={[
                "Up to 3 trips per year",
                "Basic planning tools",
                "2 collaborators per trip",
                "Community access"
              ]}
              buttonText="Get Started"
              buttonLink="/signup"
              highlighted={false}
            />
            <PricingCard 
              title="Premium"
              price="$9.99"
              period="month"
              description="For regular travelers and groups"
              features={[
                "Unlimited trips",
                "All planning tools",
                "Unlimited collaborators",
                "Budget management",
                "Sustainability tracking",
                "Priority support"
              ]}
              buttonText="Try Free for 14 Days"
              buttonLink="/signup"
              highlighted={true}
            />
            <PricingCard 
              title="Family"
              price="$14.99"
              period="month"
              description="Share with up to 6 family members"
              features={[
                "All Premium features",
                "Family sharing (6 accounts)",
                "Family trip templates",
                "Advanced budget tools",
                "Premium support"
              ]}
              buttonText="Start Family Plan"
              buttonLink="/signup"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Plan Your Next Adventure?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of travelers who are planning better trips with Dayla.
          </p>
          <Link to="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block font-medium text-lg">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Compass className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Dayla</span>
              </div>
              <p className="text-gray-400 mb-4">
                Making travel planning collaborative, sustainable, and fun.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Dayla. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Step Card Component
const StepCard: React.FC<{ number: string; title: string; description: string }> = ({ 
  number, 
  title, 
  description 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ quote: string; author: string; role: string; image: string }> = ({ 
  quote, 
  author, 
  role, 
  image 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
      <p className="text-gray-600 mb-6 italic">"{quote}"</p>
      <div className="flex items-center space-x-4">
        <img src={image} alt={author} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h4 className="font-semibold text-gray-900">{author}</h4>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

// Pricing Card Component
const PricingCard: React.FC<{ 
  title: string; 
  price: string; 
  period?: string;
  description: string; 
  features: string[];
  buttonText: string;
  buttonLink: string;
  highlighted: boolean;
}> = ({ 
  title, 
  price, 
  period = '', 
  description, 
  features, 
  buttonText, 
  buttonLink,
  highlighted
}) => {
  return (
    <div className={`rounded-xl p-6 border shadow-sm ${
      highlighted 
        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white border-transparent transform scale-105' 
        : 'bg-white/80 backdrop-blur-sm border-white/20'
    }`}>
      <h3 className={`text-2xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <div className="flex items-baseline mb-4">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>{price}</span>
        {period && <span className={`text-lg ml-1 ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>/{period}</span>}
      </div>
      <p className={`mb-6 ${highlighted ? 'text-blue-100' : 'text-gray-600'}`}>{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className={`h-5 w-5 mr-2 flex-shrink-0 ${
              highlighted ? 'text-blue-200' : 'text-green-500'
            }`} />
            <span className={highlighted ? 'text-white' : 'text-gray-700'}>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link 
        to={buttonLink} 
        className={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
          highlighted 
            ? 'bg-white text-blue-600 hover:bg-gray-100' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default LandingPage;