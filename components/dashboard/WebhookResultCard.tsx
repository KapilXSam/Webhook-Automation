import React from 'react';
import type { WebhookResult } from '../../types';
import Icon from '../ui/Icon';

interface WebhookResultCardProps {
  result: WebhookResult;
  onDelete: (id: string) => void;
}

const WebhookResultCard: React.FC<WebhookResultCardProps> = ({ result, onDelete }) => {
  // FIX: Destructure sources from the result prop.
  const { status, url, summary, timestamp, webhookName, sources } = result;

  const getStatusIndicator = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center text-blue-400">
            <Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center text-green-400">
            <Icon name="check" className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Success</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-400">
            <Icon name="alert-circle" className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Error</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-surface border border-border-color rounded-lg p-6 shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2 flex-wrap gap-x-4 gap-y-1">
            {getStatusIndicator()}
            <div className="flex items-center text-xs text-text-secondary">
                <Icon name="webhook" className="w-3.5 h-3.5 mr-1.5" />
                <span>{webhookName}</span>
            </div>
            <span className="text-xs text-text-secondary flex-shrink-0">{new Date(timestamp).toLocaleString()}</span>
          </div>
          <p className="text-sm text-text-secondary break-all truncate" title={url}>
            URL: <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{url}</a>
          </p>
        </div>
        <button 
          onClick={() => onDelete(result.id)}
          className="p-1 ml-4 text-text-secondary hover:text-red-400 transition-colors flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-red-500"
          aria-label="Delete result"
        >
          <Icon name="trash" className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-border-color">
        <h3 className="text-sm font-semibold text-text-primary mb-2">AI Summary:</h3>
        {status === 'loading' ? (
           <div className="space-y-2.5">
            <div className="h-4 bg-border-color rounded w-full animate-pulse"></div>
            <div className="h-4 bg-border-color rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-border-color rounded w-full animate-pulse"></div>
            <div className="h-4 bg-border-color rounded w-3/4 animate-pulse"></div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{summary}</p>
        )}
      </div>

      {/* FIX: Add a section to display grounding sources if they exist. */}
      {sources && sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-color">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Sources:</h3>
          <ul className="list-disc list-inside space-y-1">
            {sources.map((source, index) => (
              source.web && (
                <li key={index} className="text-sm text-text-secondary truncate">
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    title={source.web.title || source.web.uri}
                  >
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WebhookResultCard;
