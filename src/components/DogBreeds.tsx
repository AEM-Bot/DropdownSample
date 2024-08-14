import React, { useState, useEffect } from 'react';
import UiExtension from '@bloomreach/ui-extension-saas';

interface Breed {
  id: number;
  name: string;
}

const DogBreeds: React.FC = () => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [ui, setUi] = useState<any>(null);

  useEffect(() => {
    fetchBreeds();
    initializeUiExtension();
  }, []);

  const fetchBreeds = async () => {
    try {
      const response = await fetch('https://api.thedogapi.com/v1/breeds');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setBreeds(data);
    } catch (err: any) {
      setError(`Error fetching dog breeds: ${err.message}`);
      console.error(err);
    }
  };

  const initializeUiExtension = async () => {
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        const uiInstance = await UiExtension.register();
        setUi(uiInstance);
        const value = await uiInstance.document.field.getValue();
        setSelectedBreed(value || ''); // Set default value if any
      } catch (err: any) {
        console.error('Failed to register extension:', err.message);
        console.error('- error code:', err.code);
      }
    });
  };

  const onBreedSelected = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedBreed(selected);
    try {
      if (ui) {
        await ui.document.field.setValue(selected);
        showFieldValue(selected);
      }
    } catch (err: any) {
      console.error('Error setting field value:', err.code, err.message);
    }
  };

  const showFieldValue = (value: string) => {
    const fieldValueElement = document.querySelector('#fieldValue');
    if (fieldValueElement) {
      fieldValueElement.innerHTML = `Selected Breed: ${value}`;
    }
  };

  return (
    <div className="dog-breeds" id="dogBreeds">
      <select value={selectedBreed} onChange={onBreedSelected}>
        <option disabled value="">
          Select a breed
        </option>
        {breeds.map((breed) => (
          <option key={breed.id} value={breed.name}>
            {breed.name}
          </option>
        ))}
      </select>
      <p id="fieldValue">Selected Breed: {selectedBreed || 'No breed selected'}</p>
      {error && <p>{error}</p>}
    </div>
  );
};

export default DogBreeds;
