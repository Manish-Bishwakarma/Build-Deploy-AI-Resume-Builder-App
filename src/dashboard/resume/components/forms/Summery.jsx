import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GlobalApi from './../../../../../service/GlobalApi';
import { Brain, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

const prompt = "Job Title: {jobTitle}. Generate 3 professional resume summaries for this job title at different experience levels (Senior, Mid-Level, and Fresher). Return response as JSON array with this exact format: [{\"experience_level\": \"Senior Level\", \"summary\": \"summary text\"}, {\"experience_level\": \"Mid Level\", \"summary\": \"summary text\"}, {\"experience_level\": \"Fresher Level\", \"summary\": \"summary text\"}]. Each summary should be 3-4 lines.";

function Summery({ enabledNext }) {
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [summary, setSummary] = useState('');  // ✅ CHANGED: summery → summary
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState();

    useEffect(() => {
        if (resumeInfo?.summary) {
            setSummary(resumeInfo.summary);  // ✅ CHANGED: summery → summary
        }
    }, [resumeInfo]);

    const GenerateSummeryFromAI = async () => {
        setLoading(true);
        
        if (!resumeInfo?.jobTitle) {
            toast.error('Please enter a job title first');
            setLoading(false);
            return;
        }

        try {
            const PROMPT = prompt.replace('{jobTitle}', resumeInfo?.jobTitle);
            console.log('AI Prompt:', PROMPT);
            
            const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
            
            if (!API_KEY) {
                throw new Error('Google AI API Key is missing');
            }
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: PROMPT
                            }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            console.log('AI Response:', data);
            
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            console.log('Generated Text:', text);
            
            if (!text) {
                throw new Error('No response from AI');
            }
            
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsedResponse = JSON.parse(jsonMatch[0]);
                setAiGenerateSummeryList(parsedResponse);
                toast.success('AI suggestions generated!');
            } else {
                throw new Error('Could not parse AI response');
            }
            
        } catch (error) {
            console.error('AI Generation Error:', error);
            toast.error('AI generation failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    const onSave = (e) => {
        e.preventDefault();
        setLoading(true);
        
        console.log('Saving summary:', summary);  // ✅ DEBUG LOG
        
        const data = {
            data: {
                summary: summary  // ✅ CHANGED: using summary variable
            }
        };

        console.log('Data being sent:', JSON.stringify(data, null, 2));  // ✅ DEBUG LOG

        GlobalApi.UpdateResumeDetail(params?.resumeId, data).then(resp => {
            console.log('Summary saved:', resp);
            enabledNext(true);
            setLoading(false);
            
            // ✅ Update context immediately
            setResumeInfo({
                ...resumeInfo,
                summary: summary
            });
            
            toast.success('Summary updated successfully!');
        }).catch(error => {
            console.error('Save failed:', error);
            console.error('Error details:', error.response?.data);
            setLoading(false);
            toast.error('Failed to save summary');
        });
    }

    return (
        <div>
            <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
                <h2 className='font-bold text-lg'>Summary</h2>
                <p>Add Summary for your job title</p>

                <form className='mt-7' onSubmit={onSave}>
                    <div className='flex justify-between items-end'>
                        <label>Add Summary</label>
                        <Button 
                            variant="outline" 
                            onClick={GenerateSummeryFromAI} 
                            type="button" 
                            size="sm" 
                            className="border-primary text-primary flex gap-2"
                            disabled={loading}
                        > 
                            <Brain className='h-4 w-4' />
                            {loading ? 'Generating...' : 'Generate from AI'}
                        </Button>
                    </div>
                    <Textarea 
                        className="mt-5" 
                        required
                        value={summary}  // ✅ CHANGED: summery → summary
                        onChange={(e) => setSummary(e.target.value)}  // ✅ CHANGED
                        placeholder="Enter your professional summary..."
                    />
                    <div className='mt-2 flex justify-end'>
                        <Button type="submit" disabled={loading}>
                            {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>

            {aiGeneratedSummeryList && (
                <div className='my-5'>
                    <h2 className='font-bold text-lg'>Suggestions</h2>
                    {aiGeneratedSummeryList?.map((item, index) => (
                        <div 
                            key={index} 
                            onClick={() => setSummary(item?.summary)}  // ✅ CHANGED
                            className='p-5 shadow-lg my-4 rounded-lg cursor-pointer hover:scale-105 transition-all border-2 hover:border-primary'
                        >
                            <h2 className='font-bold my-1 text-primary'>
                                Level: {item?.experience_level}
                            </h2>
                            <p className='text-sm text-gray-600'>{item?.summary}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Summery;