import { Button } from '@/components/ui/button';
import { Brain, LoaderCircle } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { BtnBold, BtnBulletList, BtnItalic, BtnLink, BtnNumberedList, BtnStrikeThrough, BtnUnderline, Editor, EditorProvider, Toolbar } from 'react-simple-wysiwyg';
import { toast } from 'sonner';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';

const PROMPT = 'position title: {positionTitle}, Depends on position title give me 5-7 bullet points for my experience in resume (Please do not add experience level and No JSON array), give me result in HTML tags';

function RichTextEditor({ onRichTextEditorChange, index, defaultValue }) {
    const [value, setValue] = useState(defaultValue || '');
    const { resumeInfo } = useContext(ResumeInfoContext);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    const GenerateSummeryFromAI = async () => {
        let positionTitle = resumeInfo?.experience?.[index]?.title;
        
        if (!positionTitle) {
            const formInputs = document.querySelectorAll('input[name="title"]');
            if (formInputs[index]) {
                positionTitle = formInputs[index].value;
            }
        }
        
        if (!positionTitle || positionTitle.trim() === '') {
            toast.error('Please add Position Title first');
            return;
        }

        setLoading(true);
        try {
            const prompt = PROMPT.replace('{positionTitle}', positionTitle);
            console.log('AI Prompt:', prompt);

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
                                text: prompt
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
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!aiResponse) {
                throw new Error('No response from AI');
            }

            console.log('AI Response:', aiResponse);
            
            const cleanedResponse = aiResponse.replace('```html', '').replace('```', '').trim();
            
            // ✅ UPDATE: Set value AND trigger onChange
            setValue(cleanedResponse);
            
            // ✅ CRITICAL: Manually trigger the onChange callback
            onRichTextEditorChange({
                target: {
                    value: cleanedResponse
                }
            });
            
            toast.success('AI content generated successfully!');
        } catch (error) {
            console.error('AI Generation Error:', error);
            toast.error('Failed to generate content: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditorChange = (e) => {
        const newValue = e.target.value;
        console.log('Editor changed:', newValue);  // ✅ DEBUG LOG
        setValue(newValue);
        onRichTextEditorChange(e);
    };

    return (
        <div>
            <div className='flex justify-between my-2'>
                <label className='text-xs'>Summery</label>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={GenerateSummeryFromAI}
                    disabled={loading}
                    type="button"
                    className="flex gap-2 border-primary text-primary"
                >
                    {loading ? 
                        <LoaderCircle className='animate-spin' /> : 
                        <>
                            <Brain className='h-4 w-4' /> Generate from AI
                        </>
                    }
                </Button>
            </div>
            <EditorProvider>
                <Editor 
                    value={value} 
                    onChange={handleEditorChange}
                >
                    <Toolbar>
                        <BtnBold />
                        <BtnItalic />
                        <BtnUnderline />
                        <BtnStrikeThrough />
                        <BtnNumberedList />
                        <BtnBulletList />
                        <BtnLink />
                    </Toolbar>
                </Editor>
            </EditorProvider>
        </div>
    );
}

export default RichTextEditor;