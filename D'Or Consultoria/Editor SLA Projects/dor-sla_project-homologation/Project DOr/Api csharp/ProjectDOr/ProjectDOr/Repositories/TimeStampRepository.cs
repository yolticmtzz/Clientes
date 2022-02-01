using ProjectDOr.Contexts;
using ProjectDOr.Domains;
using ProjectDOr.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace ProjectDOr.Repositories
{
    public class TimeStampRepository : ITimeStamp
    {
        DOrContext ctx = new DOrContext();

        public List<TimeStamp> ListAllTimeStamp()
        {
            return ctx.TimeStamp.ToList();
        }

        public bool RegisterTicket(TimeStamp newTicket)
        {
            bool wasCreated = false;
            TimeStamp timeStampSearched = ctx.TimeStamp.FirstOrDefault(t => t.TicketId == newTicket.TicketId);

            if (timeStampSearched == null)
            {
                ctx.TimeStamp.Add(newTicket);

                ctx.SaveChanges();

                wasCreated = true;
            }
            return wasCreated;
        }

        public TimeStamp SearchByTicketId(int ticketId)
        {
            return ctx.TimeStamp.FirstOrDefault(t => t.TicketId == ticketId);
        }

        public TimeStampRequest UpdateTimeStamp(TimeStampRequest newRequest)
        {
            TimeStamp searchedTimeStamp = ctx.TimeStamp.FirstOrDefault(t => t.TicketId == newRequest.ticketId);
            TimeStamp newTimeStamp = new TimeStamp();

            // get all the properties of the request and put it on a array
            var properties = newRequest.customFields.GetType().GetProperties();

            bool editedObject = false;

            // verifies if the searched object exists
            if (searchedTimeStamp != null)
            {
                // verifies if the client is the same
                if (searchedTimeStamp.Client != newRequest.customFields.cf_categoria)
                {
                    foreach (var item in properties)
                    {
                        // verifies if the field is null
                        if (item.GetValue(newRequest.customFields) != null)
                        {
                            // on product this name needs to be changed
                            if (item.Name.Contains("cf_cliente"))
                            {
                                newTimeStamp.Client = item.GetValue(newRequest.customFields).ToString();
                            }

                            // verifies if the iterator is productoperator
                            if (item.Name.Contains("cf_produtooperadora"))
                            {
                                // verifies if the key is the same as the current iteration
                                // scenario 1: the iterator name is equal to the key
                                if (item.Name == searchedTimeStamp.KeyProductOperator)
                                {
                                    var value = item.GetValue(newRequest.customFields).ToString();
                                    var key = item.Name;

                                    // verifies if the value is the same
                                    // scenario 1.1: the value is the same, so it is the old value that needs to be deleted from the array
                                    if (value == searchedTimeStamp.ValueProductOperator)
                                    {
                                        // if the value is the same, the field will be set as null
                                        item.SetValue(newRequest.customFields, null);
                                    }
                                    // verifies if the value is different
                                    // scenario 1.2: the value is different, so it is the new value that needs to be keeped on the array
                                    // and updated on db
                                    else if (value != searchedTimeStamp.ValueProductOperator)
                                    {
                                        // if it isn't, the searched object will be updated with the value of the request
                                        newTimeStamp.ValueProductOperator = item.GetValue(newRequest.customFields).ToString();
                                        editedObject = true;
                                    }
                                }
                                // if the key is different
                                // scenario 2: the key is different from the iterator, so the value and the key are new
                                // and they need to be updated
                                else
                                {
                                    var value = item.GetValue(newRequest.customFields).ToString();
                                    var key = item.Name;

                                    // scenario 2.1: the value is the same, so just the key will be updated
                                    if (searchedTimeStamp.ValueProductOperator == value)
                                    {
                                        newTimeStamp.KeyProductOperator = key;
                                        editedObject = true;
                                    }
                                    // scenario 2.2: the value is different, so both value and key will be updated
                                    else
                                    {
                                        newTimeStamp.ValueProductOperator = value;
                                        newTimeStamp.KeyProductOperator = key;
                                        editedObject = true;
                                    }
                                }
                            }

                            if (item.Name.Contains("cf_categoria") && item.Name.Count() > 12)
                            {
                                // verifies if the key is the same as the current iteration
                                // scenario 1: the iterator name is equal to the key
                                if (item.Name == searchedTimeStamp.KeyCategory)
                                {
                                    var value = item.GetValue(newRequest.customFields).ToString();
                                    var key = item.Name;

                                    // verifies if the value is the same
                                    // scenario 1.1: the value is the same, so it is the old value that needs to be deleted from the array
                                    if (value == searchedTimeStamp.ValueCategory)
                                    {
                                        // if the value is the same, the field will be set as null
                                        item.SetValue(newRequest.customFields, null);
                                    }
                                    // verifies if the value is different
                                    // scenario 1.2: the value is different, so it is the new value that needs to be keeped on the array
                                    // and updated on db
                                    else if (value != searchedTimeStamp.ValueCategory)
                                    {
                                        // if it isn't, the searched object will be updated with the value of the request
                                        newTimeStamp.ValueCategory = item.GetValue(newRequest.customFields).ToString();
                                        editedObject = true;
                                    }
                                }
                                // if the key is different
                                // scenario 2: the key is different from the iterator, so the value and the key are new
                                // and they need to be updated
                                else
                                {
                                    var value = item.GetValue(newRequest.customFields).ToString();
                                    var key = item.Name;

                                    // scenario 2.1: the value is the same, so just the key will be updated
                                    if (searchedTimeStamp.ValueCategory == value)
                                    {
                                        newTimeStamp.KeyCategory = key;
                                        editedObject = true;
                                    }
                                    // scenario 2.2: the value is different, so both value and key will be updated
                                    else
                                    {
                                        newTimeStamp.ValueCategory = value;
                                        newTimeStamp.KeyCategory = key;
                                        editedObject = true;
                                    }
                                }
                            }

                            if (item.Name.Contains("cf_subcategoria") || item.Name.Contains("cf_item"))
                            {
                                // verifies if the key is the same as the current iteration
                                // scenario 1: the iterator name is equal to the key
                                if (item.Name == searchedTimeStamp.KeySubCategory)
                                {
                                    var value = item.GetValue(newRequest.customFields).ToString();
                                    var key = item.Name;

                                    // verifies if the value is the same
                                    // scenario 1.1: the value is the same, so it is the old value that needs to be deleted from the array
                                    if (value == searchedTimeStamp.ValueSubCategory)
                                    {
                                        // if the value is the same, the field will be set as null
                                        item.SetValue(newRequest.customFields, null);
                                    }
                                    // verifies if the value is different
                                    // scenario 1.2: the value is different, so it is the new value that needs to be keeped on the array
                                    // and updated on db
                                    else if (value != searchedTimeStamp.ValueSubCategory)
                                    {
                                        // if it isn't, the searched object will be updated with the value of the request
                                        newTimeStamp.ValueSubCategory = item.GetValue(newRequest.customFields).ToString();
                                        editedObject = true;
                                    }
                                }
                                // if the key is different
                                // scenario 2: the key is different from the iterator, so the value and the key are new
                                // and they need to be updated
                                else
                                {
                                    var value = item.GetValue(newRequest.customFields).ToString();
                                    var key = item.Name;

                                    // scenario 2.1: the value is the same, so just the key will be updated
                                    if (searchedTimeStamp.ValueSubCategory == value)
                                    {
                                        newTimeStamp.KeySubCategory = key;
                                        editedObject = true;
                                    }
                                    // scenario 2.2: the value is different, so both value and key will be updated
                                    else
                                    {
                                        newTimeStamp.ValueSubCategory = value;
                                        newTimeStamp.KeySubCategory = key;
                                        editedObject = true;
                                    }
                                }
                            }
                        }

                    }
                }

                else
                {
                    foreach (var item in properties)
                    {
                        if (item.Name == searchedTimeStamp.KeyProductOperator)
                        {
                            if (item.GetValue(newRequest.customFields) != null)
                            {
                                var value = item.GetValue(newRequest.customFields).ToString();

                                if (value != searchedTimeStamp.ValueProductOperator)
                                {
                                    newTimeStamp.ValueProductOperator = value;
                                    editedObject = true;
                                }
                            }
                        }

                        if (item.Name == searchedTimeStamp.KeyCategory)
                        {
                            if (item.GetValue(newRequest.customFields) != null)
                            {
                                var value = item.GetValue(newRequest.customFields).ToString();

                                if (value != searchedTimeStamp.ValueCategory)
                                {
                                    newTimeStamp.ValueCategory = value;
                                    editedObject = true;
                                }
                            }
                        }

                        if (item.Name == searchedTimeStamp.KeySubCategory)
                        {
                            if (item.GetValue(newRequest.customFields) != null)
                            {
                                var value = item.GetValue(newRequest.customFields).ToString();

                                if (searchedTimeStamp.ValueSubCategory != value)
                                {
                                    newTimeStamp.ValueSubCategory = value;
                                    editedObject = true;
                                }
                            }
                        }
                    }
                }
            }

            if (editedObject == true)
            {
                if (newTimeStamp.Client != null)
                {
                    searchedTimeStamp.Client = newTimeStamp.Client;
                }

                if (newTimeStamp.ValueProductOperator != null)
                {
                    searchedTimeStamp.ValueProductOperator = newTimeStamp.ValueProductOperator;
                }

                if (newTimeStamp.KeyProductOperator != null)
                {
                    searchedTimeStamp.KeyProductOperator = newTimeStamp.KeyProductOperator;
                }

                if (newTimeStamp.ValueCategory != null)
                {
                    searchedTimeStamp.ValueCategory = newTimeStamp.ValueCategory;
                }

                if (newTimeStamp.KeyCategory != null)
                {
                    searchedTimeStamp.KeyCategory = newTimeStamp.KeyCategory;
                }

                if (newTimeStamp.ValueSubCategory != null)
                {
                    searchedTimeStamp.ValueSubCategory = newTimeStamp.ValueSubCategory;
                }

                if (newTimeStamp.KeySubCategory != null)
                {
                    searchedTimeStamp.KeySubCategory = newTimeStamp.KeySubCategory;
                }

                ctx.TimeStamp.Update(searchedTimeStamp);
                ctx.SaveChanges();
            }

            //foreach (var property in properties)
            //{
            //    newRequest.customFields
            //        .GetType()
            //        .GetProperties()
            //        .FirstOrDefault(x => x.Name == property.Name)
            //        .SetValue(newRequest.customFields, property.GetValue(newRequest.customFields));
            //}

            return newRequest;
        }
        public void UpdateTimestampDB(TimeStamp newTimeStamp)
        {
            TimeStamp searchedTimeStamp = ctx.TimeStamp.FirstOrDefault(t => t.TicketId == newTimeStamp.TicketId);

            if (newTimeStamp != null)
            {
                if (newTimeStamp.Client != null)
                {
                    searchedTimeStamp.Client = newTimeStamp.Client;
                }

                if (newTimeStamp.ValueProductOperator != null)
                {
                    searchedTimeStamp.ValueProductOperator = newTimeStamp.ValueProductOperator;
                }

                if (newTimeStamp.KeyProductOperator != null)
                {
                    searchedTimeStamp.KeyProductOperator = newTimeStamp.KeyProductOperator;
                }

                if (newTimeStamp.ValueCategory != null)
                {
                    searchedTimeStamp.ValueCategory = newTimeStamp.ValueCategory;
                }

                if (newTimeStamp.KeyCategory != null)
                {
                    searchedTimeStamp.KeyCategory = newTimeStamp.KeyCategory;
                }

                if (newTimeStamp.ValueSubCategory != null)
                {
                    searchedTimeStamp.ValueSubCategory = newTimeStamp.ValueSubCategory;
                }

                if (newTimeStamp.KeySubCategory != null)
                {
                    searchedTimeStamp.KeySubCategory = newTimeStamp.KeySubCategory;
                }

                ctx.TimeStamp.Update(searchedTimeStamp);
                ctx.SaveChanges();
            }
        }
    }
}
