import styled from 'styled-components';

export const Container = styled.header`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
`

export const Logo = styled.img`
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    padding: 20px;

    img {
        max-width: 100%;
    }
`

export const Nav = styled.nav`
    background: #ffffff;
    padding: 20px;
`