import React, { useState, useEffect } from 'react';
import UiExtension from '@bloomreach/ui-extension-saas';

interface Mbox {
  name: string;
  status: string;
  lastRequestedAt: string;
}

const Mboxes: React.FC = () => {
  const [mboxes, setMboxes] = useState<Mbox[]>([]);
  const [selectedMbox, setSelectedMbox] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [ui, setUi] = useState<any>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    const initializeUiExtension = async () => {
      try {
        const uiInstance = await UiExtension.register();
        setUi(uiInstance);
        const value = await uiInstance.document.field.getValue();
        const mode = await (await uiInstance.document.get()).mode;
        console.log("Mode is %s", mode)
        setSelectedMbox(value || ''); // Set default value if any

        if (mode === 'edit') {
          setIsDisabled(false); // enable dropdown if mode is 'edit'
        } else {
          setIsDisabled(true); // disable dropdown if mode is view or compare
        }
      } catch (err: any) {
        console.error('Failed to register extension:', err.message);
        console.error('- error code:', err.code);
      }
    };

    const fetchMboxes = async () => {
      try {
        // Fetch mboxes from local backend API test
        const dataResponse = await fetch('https://apitest.victoriassecret.com/cmsmboxes/v1/mboxes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!dataResponse.ok) {
          throw new Error(`Failed to fetch mboxes. Status: ${dataResponse.status}`);
        }

        const data = await dataResponse.json();
        setMboxes(data.mboxes);

      } catch (err: any) {
        setError(`Error: ${err.message}`);
        console.error(err);
      }
    };

    initializeUiExtension();
    fetchMboxes(); // Fetch mboxes and populate dropdown
  }, []);

  const onMboxSelected = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedMbox(selected);
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
      fieldValueElement.innerHTML = `Selected Mbox: ${value}`;
    }
  };

  return (
    <div className="mboxes" id="mboxes">
      <select value={selectedMbox} onChange={onMboxSelected} disabled={isDisabled}>
        <option disabled value="">
          Select an mbox
        </option>
        {mboxes.map((mbox) => (
          <option key={mbox.name} value={mbox.name}>
            {mbox.name}
          </option>
        ))}
      </select>
      <p id="fieldValue">Selected Mbox: {selectedMbox || 'No mbox selected'}</p>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Mboxes;
