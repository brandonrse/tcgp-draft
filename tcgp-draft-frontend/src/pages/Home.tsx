import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="home-container">
      <h1 className="home-title">Welcome to TCGP Drafting</h1>
      <i className='home-subtitle'>Where there is no such thing as a useless card</i>
      <div className="home-buttons">
        <button className="home-button" onClick={() => navigate('/host')}>Host Draft</button>
        <button className="home-button" onClick={() => navigate('/join')}>Join Draft</button>
      </div>
      <div className='text-container'>
        <p className='about'>Have you been collecting a lot of cards in Pokémon TCG Pocket? Whether you're climbing the ranks online or in it to collect 'em all, there's lots of incredible art spanning across the series' history. But some cards just aren't quite viable for the ranked battles or even the more recent solo battles. Maybe you want to use that cool Genetic Apex Blastoise ex card, but it can't match up to the newest packs.<br /><br />

        That's where TCGP Draft comes in! Plenty of cards you may not have thought about using may suddenly become keys to victory when you're drafting from a limited pool of cards.<br/><br/>

        Each player will be given three (3) packs of ten (10) cards each. Then they'll pick one card from the first pack and pass the pack to the next player, while also receiving a pack from the previous player. Once everyone's packs are out of cards, the second pack is brought to the table. And repeat for the third pack.<br/><br/>

        Each player will end with 30 cards; a ten card buffer. Assemble your decks wisely with the cards you were dealt and then when it's all over, battle!<br /><br />
        
        Highly recommend you and your friends screenshot your decks for verification later.
        </p>
        <div className='faq-container'>
          <h3>FAQ</h3>
          <h4>Is the card pool purely random?</h4>
          <p>Not quite. Evolutions are guaranteed and certain cards will only appear in the pool if their conditions have been met in order for them to not be a dead card. Ex. Space-Time Smackdown Cynthia can only appear if a Togekiss or Garchomp is in the pool. So if you see Cynthia, know that a Garchomp or Togekiss is on the way.</p>
          <h4>How many copies of a card are in the pool?</h4>
          <p>There will be a minimum of 2 copies of a Trainer Card. 0.5 * the number of players, rounded down.<br />For Pokémon cards it depends on the stage and how many evolution stages are in that Pokémon's line:<br/>
          Pokémon that have a stage 2 evolution: 4 basic, 3 stage 1, and 2 stage 2.<br />
          Pokémon that only have a stage 1 evolution: 3 basic, 2 stage 1.<br />
          Pokémon that are basic only: 2 basic.</p>
        </div>

        <div className='status-container'>
          <h3>Status</h3>
          <table className='status-table'>
            <tbody>
              
              <tr>
                <td>Packs included:</td>
                <td>Up-to-date with Celestial Guardians</td>
              </tr>
              <tr>
                <td>Pool Ratios:</td>
                <td>Pokémon Cards: ~60%<br />Trainer Cards: ~40%</td>
              </tr>
              <tr>
                <td>Issues:</td>
                <td>
                  <li>
                    <ul>Pikachu can appear without a Raichu in the pool. Vice versa, Raichu can appear without a non-ex Pikachu.</ul>
                  </li>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <div className='credits-container'>
        <h3>Credits</h3>
        <p>Made in 2025 by Brandon R.</p>
        <p><a href='https://brewedfiction.tumblr.com/'>BrewedFiction</a> for proof-reading.</p>
        <p><a href='https://pocket.limitlesstcg.com'>pocket.limitlesstcg.com</a> for card data.</p>
      </div>
      </div>
    </main>
  );
};

export default Home;
