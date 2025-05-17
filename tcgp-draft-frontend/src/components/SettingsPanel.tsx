import React from 'react';
import { useCardData } from '../hooks/useCardData';
import './SettingsPanel.css';
import { getAllPacks } from '../services/CardService';

interface Settings {
  timerEnabled: boolean;
  allowedExpansions: string[];
  coinFlipsEnabled: boolean;
  energyGenerationEnabled: boolean;
  exsEnabled: boolean;
}

interface SettingsPanelProps {
  settings: Settings;
  toggleSetting: (key: keyof Settings) => void;
  updateAllowedExpansions: (expansion: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, toggleSetting, updateAllowedExpansions }) => {
  const { cards, loading } = useCardData();
  // const imageModules = import.meta.glob('../assets/images/expansions/*{png,jpg,jpeg,webp}', {
  //   eager: true,
  //   import: 'default',
  // }) as Record<string, string>;
  const PACKS = getAllPacks();
  // const imageUrls: string[] = Object.values(imageModules);
  // const packIds: string[] = imageUrls
  //   .map(m => m.split('/')[5].split('_')[0])
  //   .filter((id): id is string => id !== undefined);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!cards) {
    return <div>No cards available</div>;
  }

  const handleExpansionClick = (url: string) => {
    updateAllowedExpansions(url); // Toggle the expansion in the allowedExpansions array
  };

  return (
    <aside className="settings-panel">
      <h3>Settings</h3>
      <ul>
        <li>
          {/* <div className='tooltip'>
            <label>
              <input
                type="checkbox"
                checked={settings.timerEnabled}
                onChange={() => toggleSetting('timerEnabled')}
              />
              Timer
            </label>
            <span className='tooltiptext'>Enable a 30 seconds timer before a random card is selected</span>
          </div>
          <br /> */}
          <div className='tooltip'>
            <label>
              <input
                type="checkbox"
                checked={settings.coinFlipsEnabled}
                onChange={() => toggleSetting('coinFlipsEnabled')}
              />
              Coin Flips
            </label>
            <span className='tooltiptext'>Include cards that use coin flips</span>
          </div>
          <br />
          <div className='tooltip'>
            <label>
              <input
                type="checkbox"
                checked={settings.energyGenerationEnabled}
                onChange={() => toggleSetting('energyGenerationEnabled')}
              />
              Energy Generation
            </label>
            <span className='tooltiptext'>Include cards that generate energy (ex. A1 Gardevoir)</span>
          </div>
          <br />
          <div className='tooltip'>
            <label>
              <input
                type="checkbox"
                checked={settings.exsEnabled}
                onChange={() => toggleSetting('exsEnabled')}
              />
              ex Pokémon
            </label>
            <span className='tooltiptext'>Include ex Pokémon</span>
          </div>
        </li>
        <li>
          <label>
            Include Expansions:<br />
            <div className="expansion-logos">
              {/* {packIds.map((id, idx) => (
                <img
                  key={idx}
                  src={imageUrls[idx]}
                  alt={`Expansion ${id}`}
                  className={`expansion-logo ${
                    settings.allowedExpansions.includes(id) ? '' : 'grayscale'
                  }`}
                  onClick={() => handleExpansionClick(id)}
                />
              ))} */
              Object.entries(PACKS).map(([packName, fileName]) => (
                <img key={packName} src={`/assets/images/expansions/${fileName}_Set_Logo_EN.png`} alt={packName} title={packName} className={`expansion-logo ${settings.allowedExpansions.includes(fileName) ? '' : 'grayscale'}`} onClick={() => handleExpansionClick(fileName)}/>
              ))
              }
            </div>
          </label>
        </li>
      </ul>
    </aside>
  );
};

export default SettingsPanel;