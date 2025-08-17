import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Heart, DollarSign, Globe, Star, TrendingUp, Award } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Sidebar from '../component/sidebar';
interface CareerResult {
  rank: number;
  title: string;
  subtitle?: string;
  averageScore: number;
  worldNeedsScore: number;
  paidScore: number;
  loveScore: number;
  goodAtScore: number;
  color: string;
  explanation?: string;
}

interface APIResponse {
  careers: CareerResult[];
}

const IkigaiResults = () => {
  const [result, setResult] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsedResults, setParsedResults] = useState<CareerResult[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedCareer, setSelectedCareer] = useState<CareerResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { session_id } = useParams();

  // Function to parse raw string response from API
  const parseRawApiResponse = (rawResponse: string): CareerResult[] => {
    const gradientColors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-orange-500",
      "from-indigo-500 to-purple-500"
    ];

    try {
      // Extract JSON from the raw response
      // Look for JSON content between ```json and ```
      const jsonMatch = rawResponse.match(/```json\s*\n([\s\S]*?)\n```/);

      if (!jsonMatch) {
        // Fallback: try to find JSON-like content after "result:"
        const resultMatch = rawResponse.match(/result:\s*([\s\S]*)/);
        if (resultMatch) {
          const jsonContent = resultMatch[1].trim();
          // Remove markdown code blocks if present
          const cleanJson = jsonContent.replace(/```json\s*\n?|```/g, '').trim();
          const parsedData = JSON.parse(cleanJson);

          if (parsedData.careers) {
            return parsedData.careers.map((career: any, index: number) => ({
              ...career,
              color: gradientColors[index % gradientColors.length]
            }));
          }
        }
        throw new Error('No JSON content found in response');
      }

      const jsonContent = jsonMatch[1];
      const parsedData = JSON.parse(jsonContent);

      if (!parsedData.careers) {
        throw new Error('No careers array found in parsed data');
      }

      return parsedData.careers.map((career: any, index: number) => ({
        ...career,
        color: gradientColors[index % gradientColors.length]
      }));
    } catch (error) {
      console.error('Error parsing raw API response:', error);
      console.error('Raw response:', rawResponse);
      return [];
    }
  };

  useEffect(() => {
    // Real API call - uncomment and modify as needed
    const fetchResult = async () => {
      if (!session_id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:8000/chat/getResult/${session_id}`);
        const data = await res.json();

        if (res.ok && data.result) {
          // Parse the raw string response
          const parsedCareers = parseRawApiResponse(data.result);
          if (parsedCareers.length > 0) {
            setParsedResults(parsedCareers);
          } else {
            setError("Không thể parse dữ liệu từ API");
          }
        } else {
          setError("Không lấy được kết quả: " + (data.detail || "Unknown error"));
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        const errorMessage = "Lỗi kết nối server!";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();

  }, []);

  const openModal = (career: CareerResult) => {
    setSelectedCareer(career);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCareer(null);
  };

  const ScoreBar = ({ score, maxScore = 100, color = "blue" }: { score: number, maxScore?: number, color?: string }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color === 'purple' ? 'from-purple-400 to-purple-600' :
            color === 'green' ? 'from-green-400 to-green-600' :
              color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                'from-blue-400 to-blue-600'}`}
          style={{ width: `${(score / maxScore) * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 min-w-[40px]">{score}/100</span>
    </div>
  );

  const IkigaiDiagram = () => (
    <div className="relative w-80 h-80 mx-auto mb-8">
      {/* Outer circles */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 opacity-30"></div>

      {/* Four main sections */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-80 flex items-center justify-center">
        <div className="text-center text-white text-xs font-medium">
          <Heart className="w-6 h-6 mx-auto mb-1" />
          <div>What you</div>
          <div className="font-bold">LOVE</div>
        </div>
      </div>

      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-80 flex items-center justify-center">
        <div className="text-center text-white text-xs font-medium">
          <Users className="w-6 h-6 mx-auto mb-1" />
          <div>What the world</div>
          <div className="font-bold">NEEDS</div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 opacity-80 flex items-center justify-center">
        <div className="text-center text-white text-xs font-medium">
          <DollarSign className="w-6 h-6 mx-auto mb-1" />
          <div>What you can be</div>
          <div className="font-bold">PAID FOR</div>
        </div>
      </div>

      <div className="absolute top-1/2 left-6 transform -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-80 flex items-center justify-center">
        <div className="text-center text-white text-xs font-medium">
          <Award className="w-6 h-6 mx-auto mb-1" />
          <div>What you are</div>
          <div className="font-bold">GOOD AT</div>
        </div>
      </div>

      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center">
        <div className="text-center text-gray-700 text-xs font-bold">
          <div>IKIGAI</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang phân tích kết quả Ikigai của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (parsedResults.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy kết quả phù hợp.</p>
          <p className="text-sm text-gray-500">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-start gap-4">
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Ikigai của bạn được hệ lộ</h1>
                <p className="text-gray-600">Dựa trên dữ liệu và câu trả lời của bạn, AI đã xây dựng biểu đồ Ikigai cá nhân hóa dưới đây.</p>
              </div>
            </div>
          </div>

          <div className=" px-3 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Ikigai Diagram */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Biểu đồ Ikigai</h2>
                  <IkigaiDiagram />
                </div>
              </div>

              {/* Right Column - Career Results */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Top {parsedResults.length} Nghề nghiệp phù hợp</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>Độ phù hợp cao nhất</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {parsedResults.map((career, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        {/* Career Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${career.color} flex items-center justify-center text-white font-bold`}>
                              {career.rank}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">{career.title}</h3>
                              <p className="text-sm text-gray-600">{career.subtitle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{career.averageScore}</div>
                            <div className="text-xs text-gray-500">Điểm tổng</div>
                          </div>
                        </div>

                        {/* Detailed Scores */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">Thế giới cần</span>
                              <span className="text-sm text-gray-600">{career.worldNeedsScore}/100</span>
                            </div>
                            <ScoreBar score={career.worldNeedsScore} color="blue" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-700">Được trả lương</span>
                              <span className="text-sm text-gray-600">{career.paidScore}/100</span>
                            </div>
                            <ScoreBar score={career.paidScore} color="green" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium text-gray-700">Yêu thích</span>
                              <span className="text-sm text-gray-600">{career.loveScore}/100</span>
                            </div>
                            <ScoreBar score={career.loveScore} color="purple" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-700">Bạn giỏi</span>
                              <span className="text-sm text-gray-600">{career.goodAtScore}/100</span>
                            </div>
                            <ScoreBar score={career.goodAtScore} color="yellow" />
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => openModal(career)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Xem chi tiết
                          </button>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <TrendingUp className="w-4 h-4" />
                            <span>Triển vọng tốt</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2">
                        <span>Có, rất hữu ích</span>
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Cần cải thiện
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Những gợi ý này có hữu ích cho bạn không?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Detail Modal */}
      {showModal && selectedCareer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${selectedCareer.color} flex items-center justify-center text-white font-bold`}>
                    {selectedCareer.rank}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCareer.title}</h2>
                    <p className="text-gray-600">{selectedCareer.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Overall Score */}
              <div className="mb-6 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{selectedCareer.averageScore}<span className="text-lg text-gray-500">/100</span></div>
                <div className="text-sm text-gray-600">Điểm tổng thể phù hợp</div>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">Thế giới cần</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{selectedCareer.worldNeedsScore}/100</div>
                  <ScoreBar score={selectedCareer.worldNeedsScore} color="blue" />
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900">Được trả lương</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{selectedCareer.paidScore}/100</div>
                  <ScoreBar score={selectedCareer.paidScore} color="green" />
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-900">Yêu thích</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">{selectedCareer.loveScore}/100</div>
                  <ScoreBar score={selectedCareer.loveScore} color="purple" />
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-900">Bạn giỏi</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 mb-2">{selectedCareer.goodAtScore}/100</div>
                  <ScoreBar score={selectedCareer.goodAtScore} color="yellow" />
                </div>
              </div>

              {/* Explanation */}
              {selectedCareer.explanation && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Tại sao nghề này phù hợp với bạn:
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCareer.explanation}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Triển vọng nghề nghiệp tốt</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IkigaiResults;