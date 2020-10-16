import styled from 'styled-components';

export const Container = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
`;

export const Logo = styled.img`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
  cursor: pointer;

  @media screen and (min-width: 700px) {
    width: 50px;
    height: 50px;
  }

  img {
    max-width: 100%;
  }
`;

export const Nav = styled.nav`
  background: #ffffff;
  padding: 20px 10px 0;
  height: 30px;

  @media screen and (min-width: 700px) {
    padding: 20px;
  }

  a {
    font-family: 'Avenir Next LT W01 Demi';
    color: #3b3a4d;
    font-size: 13px;
    text-decoration: none;
    text-transform: uppercase;
    padding: 8px;
    letter-spacing: 1px;

    @media screen and (min-width: 700px) {
      padding: 16px;
      font-size: 16px;
    }
  }
`;
