import React, { useState } from 'react';
import { parseRecipe } from '../services/geminiService';
import { Recipe } from '../types';

export const useAIWizard = (onRecipeGenerated: (recipe: Recipe) => void, locale: string) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);

    const reset = () => {
        setInputText('');
        setSelectedFile(null);
        setErrorKey(null);
        setIsProcessing(false);
    };

    const open = () => {
        reset();
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        reset();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const setPastedFile = (file: File | null) => {
        setSelectedFile(file);
    };

    const processWizard = async () => {
        if (!inputText && !selectedFile) return;

        setIsProcessing(true);
        setErrorKey(null);

        try {
            let modelInput: string | { data: string; mimeType: string } = inputText;

            if (selectedFile) {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                        const base64 = result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                });

                modelInput = {
                    data: base64Data,
                    mimeType: selectedFile.type
                };
            }

            const generatedRecipe = await parseRecipe(modelInput, locale);
            onRecipeGenerated(generatedRecipe);
            close();
        } catch (err: any) {
            console.error("Wizard error:", err);
            // Fallback for demo purposes if API fails? Original code didn't have fallback.
            if (err.message?.includes('SAFETY')) {
                setErrorKey('wizard.errorSafety');
            } else {
                setErrorKey('wizard.errorDefault');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        isOpen,
        open,
        close,
        inputText,
        setInputText,
        selectedFile,
        handleFileChange,
        setSelectedFile: setPastedFile,
        isProcessing,
        errorKey,
        processWizard
    };
};
