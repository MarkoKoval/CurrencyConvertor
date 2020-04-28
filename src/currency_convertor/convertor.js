import React, {Component} from "react";
import Draggable from "react-draggable";
import "./style.css";
import "react-custom-scrollbars";
import currencies from "./currencies_";
import axios from "axios";

//"USD,JPY,GBP,AUD,CAD,CHF,CNY,SEK,NZD,MXN"

class CurrencyConvertor extends Component {

    constructor(props) {
        super(props);
        this.DiffMinutes = this.DiffMinutes.bind(this);
        this.RemoveFormAvailable = this.RemoveFormAvailable.bind(this);
        this.CurrenciesListInputChange = this.CurrenciesListInputChange.bind(this);
        this.Validate = this.Validate.bind(this);
        this.SetValues = this.SetValues.bind(this);
        this.ChangeOption = this.ChangeOption.bind(this);
        this.GetCurrencyRateOnlineData = this.GetCurrencyRateOnlineData.bind(this);
        this.state = {
            available_currencies: currencies.map(a => Object.assign({}, a)),
            selected_currencies: [],
            isOpen: true
        };
    }

    ChangeOption() {
     //   alert(this.state.isOpen);
        this.setState({isOpen: !this.state.isOpen})
            //    alert(this.state.isOpen);
       // document.querySelector(".add-currency-btn").classList.toggle("open");
        /*const text_set = this.state.change_button_text_set;
        const option_text = this.state.change_button_option_text;
        this.setState({change_button_text_set: option_text, change_button_option_text: text_set})*/
    }
/*
 RemoveFromSelected(abbreviation) {
        let i = this.state.selected_currencies.find(el => el.abbreviation === abbreviation);
        let arr = this.state.selected_currencies.filter(item => item.abbreviation !== abbreviation);
        this.setState({selected_currencies: arr, available_currencies: [...this.state.available_currencies, i]});
       // this.setState({available_currencies: [...this.state.available_currencies, i]});

    }

*/
    RemoveFormAvailable(e) {
        let i = this.state.available_currencies.find(el => el.abbreviation === e);
        let arr = this.state.available_currencies.filter(item => item.abbreviation !== e);
        this.setState({available_currencies: arr, selected_currencies: [...this.state.selected_currencies, i]});
       /* this.setState({selected_currencies: [...this.state.selected_currencies, i]});
        let arr = this.state.available_currencies;
        let removeIndex = this.state.available_currencies.map(function (item) {
            return item.abbreviation;
        }).indexOf(e);
        arr.splice(removeIndex, 1);
        this.setState({available_currencies: arr});*/
    }


    async GetCurrencyRateOnlineData(baseCurrency, query) {
        return axios.get("https://fixer-fixer-currency-v1.p.rapidapi.com/latest?base=" + baseCurrency + "&symbols=" + query, {
            headers: {
                "x-rapidapi-host": "fixer-fixer-currency-v1.p.rapidapi.com",
                "x-rapidapi-key": "afeaa952b5msh230ac1d5210726ap1e45c6jsnf308141e2d2f"
            },
        })
    };


    DiffMinutes(dt2, dt1) {
        let diff = Math.abs(new Date(dt2) - new Date(dt1));
        let minutes = Math.floor((diff / 1000) / 60);
        return minutes; // minutes

    }

    SetValues(data, curr_name, v) {
//        alert(JSON.stringify(data));

        this.setState(prevState => ({
            selected_currencies: prevState.selected_currencies.map(
                e => {
                    let c = Object.assign({}, e);

                    if (c.abbreviation !== curr_name) {
                        //  alert("  " +JSON.stringify(data) + " "+ JSON.stringify(typeof data) + c.abbreviation + " "+ JSON.stringify(data[c.abbreviation]));
                        if (v !== "") {
                            c.input_value = (parseFloat(data[c.abbreviation]) * parseFloat(v)).toFixed(4).toString();
                            c.textContent = `1 ${curr_name} = ${data[c.abbreviation]} ${c.abbreviation}`;
                        } else {
                            c.input_value = "";
                            c.textContent = `1 ${c.abbreviation} = ${1} ${c.abbreviation}`;
                        }
                    } else {
                        c.textContent = `1 ${curr_name} = ${1} ${curr_name}`;
                        c.input_value = v;
                    }

                    return c;
                }
            )
        }));

    }


//"USD,JPY,GBP,AUD,CAD,CHF,CNY,SEK,NZD,MXN"
    async CurrenciesListInputChange(event, v) {

        let curr_name = event.target.closest("li").id;

        let info = null;
        let query = currencies.map(a => a.abbreviation);


        if (localStorage.getItem(curr_name)) {
            let saved = JSON.parse(localStorage.getItem(curr_name)).date;

            if (this.DiffMinutes(new Date(), saved) > 30) {
                let res = await this.GetCurrencyRateOnlineData(curr_name, query);
                //   alert(JSON.stringify(res));
                //     alert("1 "+JSON.stringify(res.data.rates));
                localStorage.setItem(curr_name, JSON.stringify({
                    "date": new Date().toLocaleString(),
                    "currencies_data": JSON.stringify(res.data.rates)
                }));
                this.SetValues(res.data.rates, curr_name, v);

            } else {
                info = JSON.parse(localStorage.getItem(curr_name));
                this.SetValues(JSON.parse(info.currencies_data), curr_name, v);
            }
        } else {
            let res = await this.GetCurrencyRateOnlineData(curr_name, query);
            localStorage.setItem(curr_name, JSON.stringify({
                "date": new Date().toLocaleString(),
                "currencies_data": JSON.stringify(res.data.rates)
            }));
            this.SetValues(res.data.rates, curr_name, v);

        }
    }

    NameChange(event) {
        const input = event.target.value;
        const re = /^\d*\.?\d*$/;
        if (re.test(input)) {
            this.CurrenciesListInputChange(event, input);
        }
    }

    RemoveFromSelected(abbreviation) {
        let i = this.state.selected_currencies.find(el => el.abbreviation === abbreviation);
        let arr = this.state.selected_currencies.filter(item => item.abbreviation !== abbreviation);
        this.setState({selected_currencies: arr, available_currencies: [...this.state.available_currencies, i]});
       // this.setState({available_currencies: [...this.state.available_currencies, i]});

    }


    Validate(evt) {
        let theEvent = evt || window.event;
        let key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        let regex = /[0-9]|\./;

        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }

    render() {
        return (

            <Draggable>
                <div className="container">
                    <div className="currency-flag currency-flag-usd"></div>
                    <div className="date"></div>
                    <ul className="currencies">
                        {this.state.selected_currencies.map(currency => {
                            return <li
                                class="currency {currency.abbreviation === this.state.baseCurrency ? base-currency}"
                                id={currency.abbreviation}>
                                <img alt={currency.abbreviation} src={currency.flagURL} class="flag"/>
                                <div class="info">
                                    <p class="input" onKeyPress={this.validate} onChange={this.NameChange.bind(this)}>
                                        <span class="currency-symbol">{currency.symbol}</span>
                                        <input value={currency.input_value} placeholder="0.0000"/>
                                    </p>
                                    <p class="currency-name">{currency.abbreviation} - {currency.name}</p>
                                    <p class="base-currency-rate">  {currency.textContent} </p>
                                </div>
                                <span className="close"
                                      onClick={() => this.RemoveFromSelected(currency.abbreviation)}>&times;</span>

                            </li>

                        })}

                    </ul>
                    <button className={this.state.isOpen?"add-currency-btn": "add-currency-btn open" }
                            onClick={this.ChangeOption}>{this.state.isOpen?"Add Currency":"Show Added Currencies"}</button>

                    <ul className= "add-currency-list">

                        {this.state.available_currencies.map(value => {
                            return <li data-currency={value.abbreviation}  onClick={() => this.RemoveFormAvailable(value.abbreviation)}>
                                        <img  alt={value.abbreviation} src={value.flagURL} class="flag"/>
                                        <span>{value.abbreviation} - {value.name}</span>
                                   </li>
                        })}


                    </ul>
                </div>
            </Draggable>

        );
    }
}


export default CurrencyConvertor;