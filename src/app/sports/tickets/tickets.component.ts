import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
  standalone:false
})
export class TicketsComponent implements OnInit {
  ticketsList: any = []
  constructor(private apiSrv: ApiService) {

  }

  filterForm = new FormGroup(
    {
      'length': new FormControl(150, Validators.required),
      'start': new FormControl(0, Validators.required),
      'sortCol': new FormControl(0, Validators.required),
      'sortDir': new FormControl('desc', Validators.required)
    }
  )

  ngOnInit(): void {
    this.getTickets();
  }

  async getTickets() {
    let params = {
      body: this.filterForm.value
    }
    try {
      const apiResponse = await this.apiSrv.makeApi('AfrijeuxSportsBetting', "tickets/getTickets", "POST", params, true);
      this.ticketsList = apiResponse.data
      ////console.log(this.ticketsList)

    } catch (error) {
      console.warn(error)
    }
  }


  /**
   * Get ticket picks and show/hide it 
   * @param id 
   * @param index 
   */
  async getPicks(id: number, index: number) {
    let ticketPick: any
    if (this.ticketsList[index].isVisible == undefined) {
      ticketPick = await this.apiSrv.makeApi(`AfrijeuxSportsBetting`, `tickets/getPicks/${id}`, "GET", {}, true);
      this.ticketsList[index].picks = ticketPick
      ////console.log(ticketPick)
      ////console.log(this.ticketsList[index])
      this.ticketsList[index].isVisible = true
    }
    else if (this.ticketsList[index].isVisible) {
      this.ticketsList[index].isVisible = false
    }
    else {
      this.ticketsList[index].isVisible = true
    }
  }


  /**
   * Cancel ticket 
   * @param ticket 
   */
  async cancelTicket(ticket: any) {
    let cancelTicket = confirm('Are you sure do you want to cancel ticket?')
    if (cancelTicket) {
      let ticketsParams = {
        "issuedPersonId": ticket.IssuedPersonId,
        "issuedMachineId": ticket.IssuedMachineId,
        "machineId": ticket.IssuedMachineId,
        "gameEventId": ticket.GameEventId,
        "ticketId": ticket.TicketId,
        "fullTicketId": ticket.FullTicketId
      }
      let params = {
        body: ticketsParams
      }
      try {
        const apiResponse = await this.apiSrv.makeApi('AfrijeuxSportsBetting', "tickets/cancelticket", "POST", params, true);
        ////console.log(apiResponse)
        this.getTickets()

      } catch (error) {
        console.warn(error)
      }
    }
    else {
      alert('Ticket not canceled')
    }

  }
}
