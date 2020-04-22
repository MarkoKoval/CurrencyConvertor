import React, {Component} from "react";
import Draggable from "react-draggable";
import $ from "jquery";
import "./style.css";
import "react-custom-scrollbars";
import currencies from "./currencies_";


//"USD,JPY,GBP,AUD,CAD,CHF,CNY,SEK,NZD,MXN"

class CurrencyConvertor extends Component {

    constructor(props) {
        super(props);
        this.DiffMinutes = this.DiffMinutes.bind(this);
        this.GetCurrenciesData = this.GetCurrenciesData.bind(this);
        this.RemoveFormAvailable = this.RemoveFormAvailable.bind(this);
        this.CurrenciesListInputChange = this.CurrenciesListInputChange.bind(this);
        this.Validate = this.Validate.bind(this);
        this.SetValues = this.SetValues.bind(this);
       // alert(currencies.length);
        this.state = {
            baseCurrency: "",
            baseCurrencyAmount: 0,
            available_currencies: currencies.map(a => Object.assign({}, a)),
            selected_currencies: []
        };
    }

    ChangeOption() {
        document.querySelector(".add-currency-btn").classList.toggle("open");
        document.querySelector(".add-currency-btn").textContent =
            document.querySelector(".add-currency-btn").textContent === "Add Currency" ? "Show Added Currencies" : "Add Currency";
    }

    RemoveFormAvailable(e) {
        if (document.querySelector(".currencies").childElementCount === 0) {
            this.setState({baseCurrency: e});
            this.setState({baseCurrencyAmount: 0});
        }

        let i = this.state.available_currencies.find(el => el.abbreviation === e);
        this.setState({selected_currencies: [...this.state.selected_currencies, i]});
        let arr = this.state.available_currencies;
        let removeIndex = this.state.available_currencies.map(function (item) {
            return item.abbreviation;
        }).indexOf(e);
        arr.splice(removeIndex, 1);
        this.setState({available_currencies: arr});
    }

    async GetCurrenciesData(baseCurrency, query) {
        let settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://fixer-fixer-currency-v1.p.rapidapi.com/latest?base=" + baseCurrency + "&symbols=" + query,
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "fixer-fixer-currency-v1.p.rapidapi.com",
                "x-rapidapi-key": "afeaa952b5msh230ac1d5210726ap1e45c6jsnf308141e2d2f"
            }
        }

        await $.ajax(settings).done(function (response) {
            //   alert("1 " +JSON.stringify(response));
            localStorage.setItem(baseCurrency, JSON.stringify({
                "date": new Date().toLocaleString(),
                "currencies_data": JSON.stringify(response)
            }));
            return response;
        });
    }

    DiffMinutes(dt2, dt1) {
        let diff = Math.abs(new Date(dt2) - new Date(dt1));
        let minutes = Math.floor((diff / 1000) / 60);
        return minutes; // minutes

    }

    SetValues(data, curr_name, v) {
        data = JSON.parse(data).rates;
       // alert(JSON.stringify(data));
        document.querySelector(".currencies").querySelectorAll(".currency").forEach(currencyLI => {
            let rate = data[currencyLI.id];

            currencyLI.querySelector(".base-currency-rate").textContent = `1 ${curr_name} = ${rate} ${currencyLI.id}`;
            if (curr_name === currencyLI.id) {
                currencyLI.querySelector(".base-currency-rate").textContent = `1 ${curr_name} = ${1} ${currencyLI.id}`;
            }
        });

        document.querySelector(".currencies").querySelectorAll(".currency").forEach(currencyLI => {
            if (currencyLI.id !== curr_name) {
                const currencyRate = data[currencyLI.id];
                currencyLI.querySelector(".input input").value = (currencyRate * v).toFixed(4);
            }
        });


    }
//"USD,JPY,GBP,AUD,CAD,CHF,CNY,SEK,NZD,MXN"
    CurrenciesListInputChange(event, v) {
        let curr_name = event.target.closest("li").id;
        var info = null;
        let query = currencies.map(a => a.abbreviation);

        if (localStorage.getItem(curr_name)) {
            let saved = JSON.parse(localStorage.getItem(curr_name)).date;

            if (this.DiffMinutes(new Date(), saved) > 30) {
                $.when(this.GetCurrenciesData(curr_name, query)).done(function (e) {
                    info = localStorage.getItem(curr_name).currencies_data;
                    this.SetValues(info, curr_name, v);
                });
            } else {
                info = JSON.parse(localStorage.getItem(curr_name)).currencies_data;
                this.SetValues(info, curr_name, v);
            }
        } else {
            $.when(this.GetCurrenciesData(curr_name, query)).done(function (e) {
                info = localStorage.getItem(curr_name).currencies_data;
                this.SetValues(info, curr_name, v);
            });
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
        let arr = this.state.selected_currencies;
        let removeIndex = arr.map(function (item) {
            return item.abbreviation;
        }).indexOf(abbreviation);
        arr.splice(removeIndex, 1);
        this.setState({available_currencies: arr});
        this.setState({available_currencies: [...this.state.available_currencies, i]});

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
                <div id = "section2" className="container">
                    <div className="currency-flag currency-flag-usd"></div>
                    <div className="date"></div>
                    <ul className="currencies">
                        {this.state.selected_currencies.map(currency => {
                            return <li
                                class="currency {currency.abbreviation === this.state.baseCurrency ? base-currency}"
                                id={currency.abbreviation}>
                                <img src={currency.flagURL} class="flag"/>
                                <div class="info">
                                    <p class="input" onKeyPress={this.validate} onChange={this.NameChange.bind(this)}>
                                        <span class="currency-symbol">{currency.symbol}</span><input
                                        placeholder="0.0000"/></p>
                                    <p class="currency-name">{currency.abbreviation} - {currency.name}</p>
                                    <p class="base-currency-rate"> {this.state.baseCurrency} - {currency.abbreviation}</p>
                                </div>
                                <span className="close"
                                      onClick={() => this.RemoveFromSelected(currency.abbreviation)}>&times;</span>

                            </li>

                        })}

                    </ul>
                    <button className="add-currency-btn" onClick={this.ChangeOption}>Add Currency</button>

                    <ul className="add-currency-list">
                        <br/>
                        {this.state.available_currencies.map(value => {
                            return <li data-currency={value.abbreviation}
                                       onClick={() => this.RemoveFormAvailable(value.abbreviation)}>
                                <img src={value.flagURL} class="flag"/><span>{value.abbreviation} - {value.name}</span>
                            </li>
                        })}


                    </ul>
                </div>
            </Draggable>

        );
    }
}


export default CurrencyConvertor;