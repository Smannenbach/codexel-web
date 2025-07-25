function SimpleMarketing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Build AI Apps
            <br />
            Without Code
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create powerful AI applications, 3D sales agents, and marketing automation with our 
            revolutionary no-code platform. Deploy in minutes, not months.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
              onClick={() => window.location.href = '/workspace'}
            >
              Start Building Free →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">10,000+</div>
              <div className="text-gray-400">AI Applications Built</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">500+</div>
              <div className="text-gray-400">Business Templates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">99.9%</div>
              <div className="text-gray-400">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">24/7</div>
              <div className="text-gray-400">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleMarketing;