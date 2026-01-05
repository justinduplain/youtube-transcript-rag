import { VirtualTranscriptList } from '../components/lists/VirtualTranscriptList';
import largeDataset from '../data/large-transcript-dataset.json';

export const VirtualTranscriptPage = () => {
  return (
    <div className="grid-container padding-y-4">
      <h1 className="font-heading-xl margin-bottom-2">
        High-Performance Transcript Viewer
      </h1>
      <p className="font-body-lg text-base margin-bottom-4">
        Rendering {largeDataset.length.toLocaleString()} items using virtualization.
      </p>
      
      <div className="bg-white padding-2 border border-base-lighter rounded-lg">
        <VirtualTranscriptList 
          items={largeDataset} 
          height="70vh" 
        />
      </div>
    </div>
  );
};
