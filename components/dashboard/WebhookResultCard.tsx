import React, { useState } from 'react';
import type { WebhookResult } from '../../types';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useNotification } from '../../contexts/NotificationContext';

interface WebhookResultCardProps {
  result: WebhookResult;
  onDelete: (id: string) => void;
}

const WebhookResultCard: React.FC<WebhookResultCardProps> = ({ result, onDelete }) => {
  const { addNotification } = useNotification();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(result.summary);
    addNotification('Summary copied to clipboard!', 'success');
  };

  const formattedDate = new Date(result.timestamp).toLocaleString();

  const statusIndicator = {
    success: <Icon name="check" className="w-5 h-5 text-accent" />,
    loading: <Icon name="loader" className="w-5 h-5 text-text-secondary animate-spin" />,
    error: <Icon name="alert-circle" className="w-5 h-5 text-red-400" />,
  };

  const sourceDisplay = result.inputType === 'file' 
    ? (result.fileName || 'Uploaded File')
    : (result.url || 'N/A');

  return (
    <div className="bg-surface border border-border-color rounded-lg shadow-sm transition-all duration-300 animate-fade-in-up">
      <div className="p-4 flex justify-between items-start">
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="capitalize">{statusIndicator[result.status]}</span>
                <h3 className="font-semibold text-text-primary truncate" title={sourceDisplay}>
                  {sourceDisplay}
                </h3>
            </div>
            <p className="text-xs text-text-secondary mt-1">
                Triggered by <span className="font-medium text-text-primary">{result.webhookName}</span> &bull; {formattedDate}
            </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="subtle" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-border-color p-4">
          {result.status === 'loading' && (
            <div className="flex items-center justify-center p-8">
              <Icon name="loader" className="w-8 h-8 text-text-secondary animate-spin" />
              <p className="ml-4 text-text-secondary">{result.summary || 'AI is processing...'}</p>
            </div>
          )}
          {result.status === 'success' && (
            <div>
              <p className="text-text-primary whitespace-pre-wrap">{result.summary}</p>
              {result.sources && result.sources.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Sources:</h4>
                    <ul className="space-y-1">
                        {result.sources.map((source, index) => (
                            <li key={index} className="text-xs text-text-secondary">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline truncate">
                                    {`[${index + 1}] ${source.title || source.uri}`}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
            </div>
          )}
           {result.status === 'error' && (
            <div className="bg-red-500/10 p-4 rounded-md">
                <p className="text-red-400 font-semibold">Error</p>
                <p className="text-red-400/80 text-sm mt-1 whitespace-pre-wrap">{result.summary}</p>
            </div>
          )}
        </div>
      )}
      
      {isExpanded && result.summary && (
        <div className="border-t border-border-color p-2 flex justify-end items-center gap-2">
          {result.status === 'success' && (
            <Button variant="subtle" size="sm" onClick={handleCopySummary}>
                <Icon name="copy" className="w-4 h-4 mr-1" /> Copy Summary
            </Button>
          )}
          <Button variant="subtle" size="sm" onClick={() => onDelete(result.id)} className="hover:!bg-red-500/20 hover:!text-red-400">
            <Icon name="trash" className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebhookResultCard;
