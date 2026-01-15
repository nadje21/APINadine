import NatuurkundeOefenApp from '@/components/NatuurkundeOefenApp'

export const metadata = {
  title: 'Natuurkunde Oefenen - Elektriciteit',
  description: 'Oefen met elektriciteitsberekeningen voor HAVO/VWO onderbouw',
}

export default function NatuurkundePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Natuurkunde Oefenen
          </h1>

          <p className="text-xl text-blue-700 font-medium">
            Elektriciteitsberekeningen voor HAVO/VWO onderbouw
          </p>

          <div className="mt-4 inline-block bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">Formules die je leert:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-mono text-blue-800 font-bold">E = P × t</p>
                <p className="text-xs text-gray-600 mt-1">Energie (joule)</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="font-mono text-green-800 font-bold">P = U × I</p>
                <p className="text-xs text-gray-600 mt-1">Vermogen (watt)</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="font-mono text-yellow-800 font-bold">R = U / I</p>
                <p className="text-xs text-gray-600 mt-1">Weerstand (ohm)</p>
              </div>
            </div>
          </div>
        </div>

        <NatuurkundeOefenApp />
      </div>
    </div>
  )
}
