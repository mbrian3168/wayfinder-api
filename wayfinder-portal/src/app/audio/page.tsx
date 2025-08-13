'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { 
  Headphones, 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Download, 
  Edit, 
  Trash2,
  Volume2,
  Clock,
  Languages
} from 'lucide-react';

interface AudioContent {
  id: string;
  title: string;
  text: string;
  voiceId: string;
  audioUrl?: string;
  status: 'ready' | 'processing' | 'error' | 'draft';
  duration?: number;
  language: string;
  createdAt: string;
  usageCount: number;
  rating: number;
}

export default function AudioPage() {
  const [audioContent, setAudioContent] = useState<AudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioContent = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockData: AudioContent[] = [
          {
            id: '1',
            title: 'Welcome to Disney World',
            text: 'Welcome to the most magical place on earth!',
            voiceId: 'voice-1',
            audioUrl: '/api/audio/sample1.mp3',
            status: 'ready',
            duration: 15,
            language: 'en-US',
            createdAt: '2024-01-15T10:30:00Z',
            usageCount: 1250,
            rating: 4.8
          },
          {
            id: '2',
            title: 'Space Mountain Info',
            text: 'Get ready for an out-of-this-world adventure!',
            voiceId: 'voice-2',
            status: 'processing',
            language: 'en-US',
            createdAt: '2024-01-15T11:00:00Z',
            usageCount: 0,
            rating: 0
          },
          {
            id: '3',
            title: 'Restaurant Recommendation',
            text: 'Hungry? Try our famous Mickey-shaped pretzels!',
            voiceId: 'voice-1',
            audioUrl: '/api/audio/sample3.mp3',
            status: 'ready',
            duration: 12,
            language: 'en-US',
            createdAt: '2024-01-14T15:45:00Z',
            usageCount: 890,
            rating: 4.6
          }
        ];
        setAudioContent(mockData);
      } catch (error) {
        console.error('Error fetching audio content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioContent();
  }, []);

  const filteredAudio = audioContent.filter(audio => {
    const matchesSearch = audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audio.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || audio.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateAudio = async (audioId: string, text: string) => {
    setGeneratingAudio(audioId);
    try {
      const result = await apiClient.generateAudio(text, 'voice-1');
      setAudioContent(prev => prev.map(audio => 
        audio.id === audioId 
          ? { ...audio, audioUrl: result.audioUrl, status: 'ready' as const }
          : audio
      ));
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setGeneratingAudio(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audio Content</h1>
          <p className="text-gray-600">Manage and generate location-based audio experiences</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Audio
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audio content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="error">Error</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audio Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAudio.map((audio) => (
          <Card key={audio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{audio.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(audio.status)}>
                  {audio.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {audio.text}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Languages className="h-4 w-4" />
                    <span>{audio.language}</span>
                  </div>
                  {audio.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{audio.duration}s</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{audio.usageCount}</span>
                </div>

                {audio.rating > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium">{audio.rating}/5</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {audio.status === 'ready' && audio.audioUrl ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </>
                  ) : audio.status === 'processing' ? (
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <div className="animate-spin rounded-full h-3 w-3 mr-1 border-b-2 border-blue-600"></div>
                      Processing...
                    </Button>
                  ) : audio.status === 'draft' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleGenerateAudio(audio.id, audio.text)}
                      disabled={generatingAudio === audio.id}
                    >
                      {generatingAudio === audio.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 mr-1 border-b-2 border-blue-600"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAudio.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Headphones className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audio content found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first audio content'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Audio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{audioContent.length}</div>
              <div className="text-sm text-gray-600">Total Audio</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {audioContent.filter(a => a.status === 'ready').length}
              </div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {audioContent.filter(a => a.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {audioContent.reduce((sum, audio) => sum + audio.usageCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Plays</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}