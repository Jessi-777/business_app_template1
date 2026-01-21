export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Welcome back! Here’s a quick overview of your subscriptions and pets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-100 rounded-lg text-center">
            <h2 className="font-semibold text-blue-700">Active Subscriptions</h2>
            <p className="text-2xl font-bold text-blue-900 mt-2">3</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg text-center">
            <h2 className="font-semibold text-green-700">Pets Registered</h2>
            <p className="text-2xl font-bold text-green-900 mt-2">2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
